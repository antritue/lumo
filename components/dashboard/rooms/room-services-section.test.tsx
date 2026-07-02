import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { PropertyService } from "@/components/dashboard/properties/types";
import { renderWithProviders } from "@/test/render";
import { RoomServicesSection } from "./room-services-section";
import { useRoomServicesStore } from "./room-services-store";
import type { RoomService } from "./types";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockRoomService = (
	overrides: Partial<RoomService> = {},
): RoomService => ({
	id: "rs-1",
	roomId: "room-1",
	serviceId: "svc-elec",
	serviceName: "Electricity",
	unitLabel: "kWh",
	pricingType: "variable",
	flatAmount: null,
	unitPrice: null,
	...overrides,
});

const mockPropertyService = (
	overrides: Partial<PropertyService> = {},
): PropertyService => ({
	id: "ps-1",
	propertyId: "prop-1",
	serviceId: "svc-elec",
	serviceName: "Electricity",
	unitLabel: "kWh",
	pricingType: "variable",
	flatAmount: null,
	unitPrice: null,
	...overrides,
});

describe("RoomServicesSection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({ user: null });
		useRoomServicesStore.setState({
			roomServicesByRoomId: {},
			isRoomServicesLoading: false,
			fetchingRoomId: null,
			isRoomServicesFetchFailed: false,
			fetchRoomServices: vi.fn(),
			addRoomService: vi.fn(),
			updateRoomService: vi.fn(),
			deleteRoomService: vi.fn(),
		});
		usePropertyServicesStore.setState({
			propertyServicesByPropertyId: {},
			isPropertyServicesLoading: false,
			fetchingPropertyId: null,
			isPropertyServicesFetchFailed: false,
			fetchPropertyServices: vi.fn(),
		});
	});

	describe("Display", () => {
		it("shows loading spinner when room services are loading", () => {
			useRoomServicesStore.setState({
				fetchingRoomId: "room-1",
			});

			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector(".animate-spin")).toBeInTheDocument();
		});

		it("shows error state with retry button on fetch failure", () => {
			useRoomServicesStore.setState({
				isRoomServicesFetchFailed: true,
				fetchRoomServices: vi.fn(),
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(
				screen.getByRole("heading", { name: /failed to load data/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /try again/i }),
			).toBeInTheDocument();
		});

		it("renders service name and pricing badge", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService({ pricingType: "flat", flatAmount: 50 })],
				},
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText("Electricity")).toBeInTheDocument();
			expect(screen.getByText(/Flat fee/i)).toBeInTheDocument();
			expect(screen.getByText(/\$50\/month/i)).toBeInTheDocument();
		});

		it("shows service count", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService()],
				},
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText("1")).toBeInTheDocument();
		});

		it("shows inline shelf with available property services", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText("Quick add from property:")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /electricity/i }),
			).toBeInTheDocument();
		});

		it("hides inline shelf when no property services exist", () => {
			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(
				screen.queryByText("Quick add from property:"),
			).not.toBeInTheDocument();
		});

		it("shows amber dot when room service differs from property service", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
			});
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService({ flatAmount: 100 })],
				},
			});

			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector(".bg-amber-500")).toBeInTheDocument();
		});

		it("shows amber dot when no matching property service exists", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService()],
				},
			});

			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector(".bg-amber-500")).toBeInTheDocument();
		});

		it("shows tooltip info icon", () => {
			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector("svg.lucide-info")).toBeInTheDocument();
		});

		it("hides amber dot when property services are loading", () => {
			usePropertyServicesStore.setState({
				fetchingPropertyId: "prop-1",
				propertyServicesByPropertyId: {},
			});
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService({ flatAmount: 100 })],
				},
			});

			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector(".bg-amber-500")).not.toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls fetchRoomServices on retry button click", async () => {
			const fetchRoomServices = vi.fn();
			useRoomServicesStore.setState({
				isRoomServicesFetchFailed: true,
				fetchRoomServices,
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByRole("button", { name: /try again/i }));

			expect(fetchRoomServices).toHaveBeenCalledWith("room-1", "prop-1");
		});

		it("opens info popover with hierarchy explanation on icon click", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(
				screen.getByRole("button", {
					name: /about service hierarchy/i,
				}),
			);

			expect(
				screen.getByText(
					"Services work in three layers: create templates globally, customize per property, assign to rooms.",
				),
			).toBeInTheDocument();
			expect(screen.getByRole("link", { name: /services/i })).toHaveAttribute(
				"href",
				"/dashboard/services",
			);
		});

		it("opens add dialog on plus button click", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByRole("button", { name: /add service/i }));

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByRole("textbox", { name: /service name/i }),
			).toBeInTheDocument();
		});

		it("opens edit dialog with inherited values on badge click", async () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService({ flatAmount: 75 })],
				},
			});
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({ pricingType: "flat", flatAmount: null }),
					],
				},
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByText("Electricity"));

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();

			const amountInput = within(dialog).getByRole("spinbutton", {
				name: /flat amount/i,
			});
			expect(amountInput).toHaveValue(75);

			expect(
				screen.getByText(/customized from the property default/i),
			).toBeInTheDocument();
		});

		it("opens delete dialog on X button click", async () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService()],
				},
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(
				screen.getByRole("button", { name: /remove electricity/i }),
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});

		it("calls addRoomService when inline shelf button is clicked", async () => {
			const addRoomService = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({ addRoomService });
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
			});

			const user = userEvent.setup();
			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByRole("button", { name: /electricity/i }));

			expect(addRoomService).toHaveBeenCalledWith("room-1", "svc-elec", {
				serviceName: "Electricity",
				unitLabel: "kWh",
				pricingType: "variable",
				flatAmount: null,
				unitPrice: null,
			});
		});

		it("shows loading spinner on inline shelf button during activation", async () => {
			const neverResolve = new Promise(() => {});
			useRoomServicesStore.setState({
				addRoomService: vi.fn().mockReturnValue(neverResolve),
			});
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
			});

			const user = userEvent.setup();
			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			const button = screen.getByRole("button", { name: /electricity/i });
			await user.click(button);

			expect(button.querySelector(".animate-spin")).toBeInTheDocument();
			expect(button).toBeDisabled();
		});

		it("calls addRoomService on save in add mode", async () => {
			const addRoomService = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({ addRoomService });

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByRole("button", { name: /add service/i }));

			const dialog = screen.getByRole("dialog");
			await user.type(
				within(dialog).getByRole("textbox", { name: /service name/i }),
				"WiFi",
			);
			await user.click(
				within(dialog).getByRole("button", { name: /add service/i }),
			);

			expect(addRoomService).toHaveBeenCalledWith(
				"room-1",
				expect.any(String),
				expect.objectContaining({ serviceName: "WiFi" }),
			);
		});

		it("calls updateRoomService on save in edit mode", async () => {
			const updateRoomService = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService()],
				},
				updateRoomService,
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByText("Electricity"));

			const dialog = screen.getByRole("dialog");
			const nameInput = within(dialog).getByRole("textbox", {
				name: /service name/i,
			});
			await user.clear(nameInput);
			await user.type(nameInput, "Updated Name");
			await user.click(within(dialog).getByRole("button", { name: /save/i }));

			expect(updateRoomService).toHaveBeenCalledWith(
				"room-1",
				"svc-elec",
				expect.objectContaining({ serviceName: "Updated Name" }),
			);
		});

		it("calls deleteRoomService on delete confirm", async () => {
			const deleteRoomService = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService()],
				},
				deleteRoomService,
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(
				screen.getByRole("button", { name: /remove electricity/i }),
			);

			const dialog = screen.getByRole("dialog");
			await user.click(
				within(dialog).getByRole("button", { name: /delete service/i }),
			);

			expect(deleteRoomService).toHaveBeenCalledWith("room-1", "svc-elec");
		});
	});
});
