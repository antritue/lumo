import type { User } from "@supabase/supabase-js";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { renderWithProviders } from "@/test/render";
import { RoomServicesSection } from "./room-services-section";
import { useRoomServicesStore } from "./room-services-store";
import type { EffectiveRoomService } from "./types";

const mockEffectiveService = (
	overrides: Partial<EffectiveRoomService> = {},
): EffectiveRoomService => ({
	propertyServiceId: "ps-1",
	serviceName: "Electricity",
	unitLabel: "kWh",
	pricingType: "variable",
	flatAmount: null,
	unitPrice: 0.12,
	isOverridden: false,
	isEnabled: true,
	...overrides,
});

describe("RoomServicesSection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({ user: { id: "user-1" } as User });
		useRoomServicesStore.setState({
			roomServicesByRoomId: {},
			isRoomServicesLoading: false,
			fetchingRoomId: null,
			isRoomServicesFetchFailed: false,
			fetchRoomServices: vi.fn(),
			toggleService: vi.fn(),
			setCustomPrice: vi.fn(),
			resetToDefault: vi.fn(),
		});
	});

	describe("Display", () => {
		it("shows loading skeleton when room services are loading", () => {
			useRoomServicesStore.setState({
				fetchingRoomId: "room-1",
			});

			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector(".animate-shimmer")).toBeInTheDocument();
		});

		it("shows error state with retry button on fetch failure", () => {
			useRoomServicesStore.setState({
				isRoomServicesFetchFailed: true,
				fetchRoomServices: vi.fn(),
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText(/failed to load services/i)).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /try again/i }),
			).toBeInTheDocument();
		});

		it("renders service name in a pill", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							pricingType: "flat",
							flatAmount: 50,
							unitPrice: null,
						}),
					],
				},
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText("Electricity")).toBeInTheDocument();
		});

		it("shows service count", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService()],
				},
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText("1")).toBeInTheDocument();
		});

		it("shows amber dot for overridden services", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService({ isOverridden: true })],
				},
			});

			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector(".bg-amber-500")).toBeInTheDocument();
		});

		it("shows /off label for disabled services", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService({ isEnabled: false })],
				},
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText("/off")).toBeInTheDocument();
		});

		it("shows empty state when no services", () => {
			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(screen.getByText(/no services/i)).toBeInTheDocument();
		});

		it("shows tooltip info icon", () => {
			const { container } = renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(container.querySelector("svg.lucide-info")).toBeInTheDocument();
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

		it("opens info popover on icon click", async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(
				screen.getByRole("button", {
					name: /About service hierarchy/i,
				}),
			);

			expect(screen.getByText(/Inherited/i)).toBeInTheDocument();
		});

		it("calls toggleService when disable button is clicked", async () => {
			const toggleService = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService({ isEnabled: true })],
				},
				toggleService,
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(
				screen.getByRole("button", { name: /disable electricity/i }),
			);

			expect(toggleService).toHaveBeenCalledWith("room-1", "ps-1", false);
		});

		it("calls toggleService when enable button is clicked", async () => {
			const toggleService = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService({ isEnabled: false })],
				},
				toggleService,
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(
				screen.getByRole("button", { name: /enable electricity/i }),
			);

			expect(toggleService).toHaveBeenCalledWith("room-1", "ps-1", true);
		});

		it("calls resetToDefault when reset button is clicked", async () => {
			const resetToDefault = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService({ isOverridden: true })],
				},
				resetToDefault,
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByRole("button", { name: /reset/i }));

			expect(resetToDefault).toHaveBeenCalledWith("room-1", "ps-1");
		});

		it("does not show reset button for non-overridden services", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService({ isOverridden: false })],
				},
			});

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			expect(
				screen.queryByRole("button", { name: /reset/i }),
			).not.toBeInTheDocument();
		});

		it("opens edit popover when service name is clicked", async () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							pricingType: "flat",
							flatAmount: 50,
							unitPrice: null,
						}),
					],
				},
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getAllByText("Electricity")[0]);

			expect(screen.getByRole("spinbutton")).toBeInTheDocument();
		});

		it("calls setCustomPrice when saving edit popover", async () => {
			const setCustomPrice = vi.fn().mockResolvedValue(undefined);
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							pricingType: "flat",
							flatAmount: 50,
							unitPrice: null,
						}),
					],
				},
				setCustomPrice,
			});

			const user = userEvent.setup();

			renderWithProviders(
				<RoomServicesSection roomId="room-1" propertyId="prop-1" />,
			);

			await user.click(screen.getByText("Electricity"));

			const input = screen.getByRole("spinbutton");
			await user.clear(input);
			await user.type(input, "75");

			await user.click(screen.getByRole("button", { name: /save/i }));

			expect(setCustomPrice).toHaveBeenCalledWith("room-1", "ps-1", 75, null);
		});
	});
});
