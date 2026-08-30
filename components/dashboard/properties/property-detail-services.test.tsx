import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { PropertyService } from "@/components/dashboard/properties/types";
import { renderWithProviders } from "@/test/render";
import { PropertyDetailServices } from "./property-detail-services";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockPropertyService = (
	overrides: Partial<PropertyService> = {},
): PropertyService => ({
	id: "ps-1",
	propertyId: "prop-1",
	serviceName: "Electricity",
	unitLabel: "kWh",
	pricingType: "variable",
	flatAmount: null,
	unitPrice: null,
	...overrides,
});

describe("PropertyDetailServices", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({ user: null });
		usePropertyServicesStore.setState({
			propertyServicesByPropertyId: {},
			isPropertyServicesLoading: false,
			fetchingPropertyId: null,
			isPropertyServicesFetchFailed: false,
			fetchPropertyServices: vi.fn(),
			addPropertyService: vi.fn(),
			updatePropertyService: vi.fn(),
			deletePropertyService: vi.fn(),
		});
	});

	describe("Display", () => {
		it("shows loading spinner when property services are loading", () => {
			usePropertyServicesStore.setState({
				fetchingPropertyId: "prop-1",
			});

			const { container } = renderWithProviders(
				<PropertyDetailServices propertyId="prop-1" />,
			);

			expect(container.querySelector(".animate-shimmer")).toBeInTheDocument();
		});

		it("shows error state with retry button on fetch failure", () => {
			usePropertyServicesStore.setState({
				isPropertyServicesFetchFailed: true,
				fetchPropertyServices: vi.fn(),
			});

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(
				screen.getByRole("heading", { name: /failed to load data/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /try again/i }),
			).toBeInTheDocument();
		});

		it("renders service badges for property services", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
			});

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(screen.getByText("Electricity")).toBeInTheDocument();
		});

		it("shows service count", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService(),
						mockPropertyService({
							id: "ps-2",
							serviceName: "Water",
						}),
					],
				},
			});

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("shows preset shelf when presets are not yet added", () => {
			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(screen.getByText("Quick add from global:")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /electricity/i }),
			).toBeInTheDocument();
		});

		it("hides preset shelf when all presets are already added", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({ serviceName: "Electricity" }),
						mockPropertyService({
							id: "ps-2",
							serviceName: "Water",
						}),
						mockPropertyService({
							id: "ps-3",
							serviceName: "WiFi",
						}),
						mockPropertyService({
							id: "ps-4",
							serviceName: "Cleaning",
						}),
						mockPropertyService({
							id: "ps-5",
							serviceName: "Parking",
						}),
					],
				},
			});

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(
				screen.queryByText("Quick add from global:"),
			).not.toBeInTheDocument();
		});

		it("shows tooltip info icon", () => {
			const { container } = renderWithProviders(
				<PropertyDetailServices propertyId="prop-1" />,
			);

			expect(container.querySelector("svg.lucide-info")).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls fetchPropertyServices on retry button click", async () => {
			const fetchPropertyServices = vi.fn();
			usePropertyServicesStore.setState({
				isPropertyServicesFetchFailed: true,
				fetchPropertyServices,
			});

			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(screen.getByRole("button", { name: /try again/i }));

			expect(fetchPropertyServices).toHaveBeenCalledWith("prop-1");
		});

		it("opens add dialog on plus button click", async () => {
			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(screen.getByRole("button", { name: /add service/i }));

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(
				screen.getByRole("textbox", { name: /service name/i }),
			).toBeInTheDocument();
		});

		it("opens add dialog with preset data when preset button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(screen.getByRole("button", { name: /electricity/i }));

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			const nameInput = within(screen.getByRole("dialog")).getByRole(
				"textbox",
				{
					name: /service name/i,
				},
			);
			expect(nameInput).toHaveValue("Electricity");
		});

		it("opens edit dialog on badge click", async () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService({ unitPrice: 200 })],
				},
			});

			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(screen.getByText("Electricity"));

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();

			const amountInput = within(dialog).getByRole("spinbutton", {
				name: /unit price/i,
			});
			expect(amountInput).toHaveValue(200);
		});

		it("opens delete dialog on X button click", async () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
			});

			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(
				screen.getByRole("button", {
					name: /remove electricity/i,
				}),
			);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});

		it("calls add on save in add mode", async () => {
			const addPropertyService = vi.fn().mockResolvedValue(undefined);
			usePropertyServicesStore.setState({
				addPropertyService,
			});

			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(screen.getByRole("button", { name: /add service/i }));

			const dialog = screen.getByRole("dialog");
			await user.type(
				within(dialog).getByRole("textbox", { name: /service name/i }),
				"WiFi",
			);
			await user.click(
				within(dialog).getByRole("button", { name: /add service/i }),
			);

			expect(addPropertyService).toHaveBeenCalledWith(
				"prop-1",
				expect.objectContaining({ serviceName: "WiFi" }),
			);
		});

		it("calls update on save in edit mode", async () => {
			const updatePropertyService = vi.fn().mockResolvedValue(undefined);
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
				updatePropertyService,
			});

			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(screen.getByText("Electricity"));

			const dialog = screen.getByRole("dialog");
			const nameInput = within(dialog).getByRole("textbox", {
				name: /service name/i,
			});
			await user.clear(nameInput);
			await user.type(nameInput, "Updated Name");
			await user.click(within(dialog).getByRole("button", { name: /save/i }));

			expect(updatePropertyService).toHaveBeenCalledWith(
				"prop-1",
				"ps-1",
				expect.objectContaining({ serviceName: "Updated Name" }),
			);
		});

		it("calls remove on delete confirm", async () => {
			const deletePropertyService = vi.fn().mockResolvedValue(undefined);
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
				deletePropertyService,
			});

			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(
				screen.getByRole("button", {
					name: /remove electricity/i,
				}),
			);

			const dialog = screen.getByRole("dialog");
			await user.click(
				within(dialog).getByRole("button", {
					name: /delete service/i,
				}),
			);

			expect(deletePropertyService).toHaveBeenCalledWith("prop-1", "ps-1");
		});
	});
});
