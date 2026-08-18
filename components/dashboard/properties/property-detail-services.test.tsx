import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { PropertyService } from "@/components/dashboard/properties/types";
import { useServicesStore } from "@/components/dashboard/services/store";
import type { Service } from "@/components/dashboard/services/types";
import { renderWithProviders } from "@/test/render";
import { PropertyDetailServices } from "./property-detail-services";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockGlobalService = (overrides: Partial<Service> = {}): Service => ({
	id: "svc-elec",
	userId: "",
	name: "Electricity",
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

describe("PropertyDetailServices", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({ user: null });
		useServicesStore.setState({
			services: [mockGlobalService()],
			isServicesLoading: false,
			hasServicesFetched: true,
			servicesFetchFailed: false,
			fetchServices: vi.fn(),
		});
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
							serviceId: "svc-water",
							serviceName: "Water",
						}),
					],
				},
			});

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("shows custom dot when service differs from global default", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService({ flatAmount: 100 })],
				},
			});

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(document.querySelector(".bg-amber-500")).toBeInTheDocument();
		});

		it("shows inline shelf with available global services", () => {
			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(screen.getByText("Quick add from global:")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /electricity/i }),
			).toBeInTheDocument();
		});

		it("hides inline shelf when all global services are already added", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
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

		it("shows custom dot for service not in global catalog", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							serviceId: "svc-custom",
							serviceName: "Custom",
						}),
					],
				},
			});

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			expect(document.querySelector(".bg-amber-500")).toBeInTheDocument();
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

		it("opens info popover with hierarchy explanation on icon click", async () => {
			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(
				screen.getByRole("button", {
					name: /about service hierarchy/i,
				}),
			);

			expect(
				screen.getByText(
					"Services work in three layers: create templates globally, customize per property, assign to rooms",
				),
			).toBeInTheDocument();
			expect(screen.getByRole("link", { name: /services/i })).toHaveAttribute(
				"href",
				"/dashboard/services",
			);
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

		it("calls addPropertyService when inline shelf button is clicked", async () => {
			const addPropertyService = vi.fn().mockResolvedValue(undefined);
			usePropertyServicesStore.setState({ addPropertyService });

			const user = userEvent.setup();
			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			await user.click(screen.getByRole("button", { name: /electricity/i }));

			expect(addPropertyService).toHaveBeenCalledWith("prop-1", "svc-elec", {
				serviceName: "Electricity",
				unitLabel: "kWh",
				pricingType: "variable",
				flatAmount: null,
				unitPrice: null,
			});
		});

		it("shows loading spinner on inline shelf button during activation", async () => {
			const neverResolve = new Promise(() => {});
			usePropertyServicesStore.setState({
				addPropertyService: vi.fn().mockReturnValue(neverResolve),
			});

			const user = userEvent.setup();
			renderWithProviders(<PropertyDetailServices propertyId="prop-1" />);

			const button = screen.getByRole("button", { name: /electricity/i });
			await user.click(button);

			expect(button.querySelector(".animate-spin")).toBeInTheDocument();
			expect(button).toBeDisabled();
		});

		it("opens edit dialog on badge click with merged values", async () => {
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
				expect.any(String),
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
				"svc-elec",
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

			expect(deletePropertyService).toHaveBeenCalledWith("prop-1", "svc-elec");
		});
	});
});
