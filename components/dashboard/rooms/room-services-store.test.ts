import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { PropertyService } from "@/components/dashboard/properties/types";
import { useRoomServicesStore } from "./room-services-store";
import type { EffectiveRoomService } from "./types";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPropertyService = (
	overrides: Partial<PropertyService> = {},
): PropertyService => ({
	id: "ps-1",
	propertyId: "prop-1",
	serviceName: "Electricity",
	unitLabel: "kWh",
	pricingType: "variable",
	flatAmount: null,
	unitPrice: 0.12,
	...overrides,
});

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

const authenticate = () => {
	useAuthStore.setState({ user: { id: "user-123" } as User });
};

const mockErrorConsole = () =>
	vi.spyOn(console, "error").mockImplementation(() => {});

describe("RoomServicesStore", () => {
	beforeEach(() => {
		useRoomServicesStore.setState({
			roomServicesByRoomId: {},
			isRoomServicesLoading: false,
			fetchingRoomId: null,
			isRoomServicesFetchFailed: false,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});
	describe("fetchRoomServices", () => {
		beforeEach(() => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
				isPropertyServicesLoading: false,
				fetchingPropertyId: null,
				isPropertyServicesFetchFailed: false,
				fetchPropertyServices: vi.fn().mockResolvedValue(undefined),
			});
		});

		it("does nothing when unauthenticated", async () => {
			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toBeUndefined();
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("fetches overrides and merges with property services", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId, isRoomServicesLoading } =
				useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toEqual([mockEffectiveService()]);
			expect(isRoomServicesLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/service-overrides",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("applies override values when override exists", async () => {
			authenticate();

			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService({ id: "ps-1" })],
				},
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					{
						service_id: "ps-1",
						is_enabled: false,
						custom_flat_amount: 75,
						custom_unit_price: null,
					},
				],
			});

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].flatAmount).toBe(75);
			expect(roomServicesByRoomId["room-1"][0].isEnabled).toBe(false);
			expect(roomServicesByRoomId["room-1"][0].isOverridden).toBe(true);
		});

		it("stores empty array when property has no services", async () => {
			authenticate();

			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: { "prop-1": [] },
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(0);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { isRoomServicesLoading, isRoomServicesFetchFailed } =
				useRoomServicesStore.getState();
			expect(isRoomServicesLoading).toBe(false);
			expect(isRoomServicesFetchFailed).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("prevents duplicate fetches when already loading", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce(new Promise(() => {}));

			useRoomServicesStore.getState().fetchRoomServices("room-1", "prop-1");

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("toggleService", () => {
		it("calls API and updates state when authenticated", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							propertyServiceId: "ps-1",
							isEnabled: true,
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await useRoomServicesStore
				.getState()
				.toggleService("room-1", "ps-1", false);

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].isEnabled).toBe(false);
			expect(roomServicesByRoomId["room-1"][0].isOverridden).toBe(true);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/service-overrides",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ serviceId: "ps-1", isEnabled: false }),
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							propertyServiceId: "ps-1",
							isEnabled: true,
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRoomServicesStore.getState().toggleService("room-1", "ps-1", false),
			).rejects.toThrow("Failed to toggle service");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].isEnabled).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("setCustomPrice", () => {
		it("calls API and updates state when authenticated", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							propertyServiceId: "ps-1",
							flatAmount: null,
							unitPrice: 0.12,
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await useRoomServicesStore
				.getState()
				.setCustomPrice("room-1", "ps-1", 100, null);

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].flatAmount).toBe(100);
			expect(roomServicesByRoomId["room-1"][0].isOverridden).toBe(true);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/service-overrides",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({
						serviceId: "ps-1",
						customFlatAmount: 100,
						customUnitPrice: null,
					}),
					credentials: "include",
				}),
			);
		});
	});

	describe("resetToDefault", () => {
		it("deletes override and resets to inherited values", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							propertyServiceId: "ps-1",
							isOverridden: true,
							isEnabled: false,
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await useRoomServicesStore.getState().resetToDefault("room-1", "ps-1");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].isOverridden).toBe(false);
			expect(roomServicesByRoomId["room-1"][0].isEnabled).toBe(true);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/service-overrides/ps-1",
				expect.objectContaining({
					method: "DELETE",
					credentials: "include",
				}),
			);
		});

		it("does nothing when service is not overridden", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockEffectiveService({
							propertyServiceId: "ps-1",
							isOverridden: false,
						}),
					],
				},
			});

			await useRoomServicesStore.getState().resetToDefault("room-1", "ps-1");

			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockEffectiveService()],
				},
				isRoomServicesLoading: true,
				fetchingRoomId: "room-1",
				isRoomServicesFetchFailed: true,
			});

			useRoomServicesStore.getState().clearStore();

			expect(useRoomServicesStore.getState().roomServicesByRoomId).toEqual({});
			expect(useRoomServicesStore.getState().isRoomServicesLoading).toBe(false);
			expect(useRoomServicesStore.getState().fetchingRoomId).toBeNull();
			expect(useRoomServicesStore.getState().isRoomServicesFetchFailed).toBe(
				false,
			);
		});
	});
});
