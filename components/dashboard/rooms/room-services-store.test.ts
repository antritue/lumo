import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import { useRoomServicesStore } from "./room-services-store";
import type { RoomService } from "./types";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockRoomService = (
	overrides: Partial<RoomService> = {},
): RoomService => ({
	id: "test-uuid",
	roomId: "room-1",
	serviceId: "svc-1",
	serviceName: "",
	unitLabel: null,
	pricingType: "flat",
	flatAmount: null,
	unitPrice: null,
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
			loadingRoomIds: [],
			failedRoomIds: [],
		});
		usePropertyServicesStore.setState({
			propertyServicesByPropertyId: {
				"prop-1": [
					{
						id: "ps-1",
						propertyId: "prop-1",
						serviceId: "svc-elec",
						serviceName: "Electricity",
						unitLabel: "kWh",
						pricingType: "variable",
						flatAmount: null,
						unitPrice: null,
					},
					{
						id: "ps-2",
						propertyId: "prop-1",
						serviceId: "svc-water",
						serviceName: "Water",
						unitLabel: "m³",
						pricingType: "variable",
						flatAmount: null,
						unitPrice: null,
					},
				],
			},
			isPropertyServicesLoading: false,
			fetchingPropertyId: null,
			isPropertyServicesFetchFailed: false,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("fetchRoomServices", () => {
		it("seeds from property services when unauthenticated", async () => {
			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			const services = roomServicesByRoomId["room-1"];
			expect(services).toHaveLength(2);
			expect(services[0].serviceName).toBe("Electricity");
			expect(services[0].serviceId).toBe("svc-elec");
			expect(services[1].serviceName).toBe("Water");
			expect(services[1].serviceId).toBe("svc-water");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("skips seeding when room already has services in the store", async () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "existing",
							serviceId: "svc-existing",
							serviceName: "Existing",
						}),
					],
				},
			});

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(1);
			expect(roomServicesByRoomId["room-1"][0].serviceName).toBe("Existing");
		});

		it("fetches and sets room services when authenticated", async () => {
			authenticate();

			const mockServices = [
				mockRoomService({
					id: "rs-1",
					serviceId: "svc-elec",
					serviceName: "Electricity",
				}),
				mockRoomService({
					id: "rs-2",
					serviceId: "svc-water",
					serviceName: "Water",
				}),
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockServices,
			});

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId, isRoomServicesLoading } =
				useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toEqual(mockServices);
			expect(isRoomServicesLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/services",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("creates default room services from property services when authenticated room has no services", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			const createdServices = [
				mockRoomService({
					roomId: "room-1",
					serviceId: "svc-elec",
					serviceName: "Electricity",
					unitLabel: "kWh",
					pricingType: "variable",
				}),
				mockRoomService({
					roomId: "room-1",
					serviceId: "svc-water",
					serviceName: "Water",
					unitLabel: "m³",
					pricingType: "variable",
				}),
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => createdServices,
			});

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(2);
			expect(roomServicesByRoomId["room-1"][0].serviceName).toBe("Electricity");
			expect(roomServicesByRoomId["room-1"][1].serviceName).toBe("Water");
			expect(mockFetch).toHaveBeenCalledTimes(2);

			expect(mockFetch).toHaveBeenNthCalledWith(
				1,
				"/api/rooms/room-1/services",
				expect.objectContaining({ method: "GET" }),
			);
			expect(mockFetch).toHaveBeenNthCalledWith(
				2,
				"/api/rooms/room-1/services",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify([
						{
							serviceId: "svc-elec",
							serviceName: "Electricity",
							unitLabel: "kWh",
							pricingType: "variable",
							flatAmount: null,
							unitPrice: null,
						},
						{
							serviceId: "svc-water",
							serviceName: "Water",
							unitLabel: "m³",
							pricingType: "variable",
							flatAmount: null,
							unitPrice: null,
						},
					]),
				}),
			);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await useRoomServicesStore
				.getState()
				.fetchRoomServices("room-1", "prop-1");

			const { isRoomServicesLoading, failedRoomIds } =
				useRoomServicesStore.getState();
			expect(isRoomServicesLoading).toBe(false);
			expect(failedRoomIds).toContain("room-1");
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

	describe("addRoomService", () => {
		it("adds service locally when unauthenticated", async () => {
			await useRoomServicesStore
				.getState()
				.addRoomService("room-1", "svc-new", {
					serviceName: "New Service",
					unitLabel: "units",
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 50,
				});

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			const services = roomServicesByRoomId["room-1"];
			expect(services).toHaveLength(1);
			expect(services[0].serviceId).toBe("svc-new");
			expect(services[0].serviceName).toBe("New Service");
			expect(services[0].unitLabel).toBe("units");
			expect(services[0].pricingType).toBe("variable");
			expect(services[0].unitPrice).toBe(50);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			const created = mockRoomService({
				id: "server-id",
				roomId: "room-1",
				serviceId: "svc-new",
				serviceName: "Test",
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [created],
			});

			await useRoomServicesStore
				.getState()
				.addRoomService("room-1", "svc-new", {
					serviceName: "Test",
					unitLabel: null,
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
				});

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(1);
			expect(roomServicesByRoomId["room-1"][0]).toEqual(created);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/services",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify([
						{
							serviceId: "svc-new",
							serviceName: "Test",
							unitLabel: null,
							pricingType: "flat",
							flatAmount: null,
							unitPrice: null,
						},
					]),
					credentials: "include",
				}),
			);
		});

		it("does not add duplicate serviceId", async () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "existing",
							serviceId: "svc-existing",
						}),
					],
				},
			});

			await useRoomServicesStore
				.getState()
				.addRoomService("room-1", "svc-existing", {
					serviceName: "Dup",
					unitLabel: null,
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
				});

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(1);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("handles API error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRoomServicesStore.getState().addRoomService("room-1", "svc-new", {
					serviceName: "Fail",
					unitLabel: null,
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
				}),
			).rejects.toThrow("Failed to add room service");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toBeUndefined();
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("updateRoomService", () => {
		it("updates service locally when unauthenticated", async () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "1",
							serviceId: "svc-1",
							serviceName: "Original",
						}),
						mockRoomService({
							id: "2",
							serviceId: "svc-2",
							serviceName: "Second",
						}),
					],
				},
			});

			await useRoomServicesStore
				.getState()
				.updateRoomService("room-1", "svc-1", {
					serviceName: "Updated",
				});

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].serviceName).toBe("Updated");
			expect(roomServicesByRoomId["room-1"][1].serviceName).toBe("Second");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "1",
							roomId: "room-1",
							serviceId: "svc-1",
							serviceName: "Original",
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: "1",
					serviceName: "Updated",
				}),
			});

			await useRoomServicesStore
				.getState()
				.updateRoomService("room-1", "svc-1", {
					serviceName: "Updated",
				});

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].serviceName).toBe("Updated");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/services/svc-1",
				expect.objectContaining({
					method: "PATCH",
					body: JSON.stringify({ serviceName: "Updated" }),
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "1",
							roomId: "room-1",
							serviceId: "svc-1",
							serviceName: "Original",
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRoomServicesStore.getState().updateRoomService("room-1", "svc-1", {
					serviceName: "Updated",
				}),
			).rejects.toThrow("Failed to update room service");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"][0].serviceName).toBe("Original");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deleteRoomService", () => {
		it("removes service locally when unauthenticated", async () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "1",
							serviceId: "svc-keep",
						}),
						mockRoomService({
							id: "2",
							serviceId: "svc-remove",
						}),
					],
				},
			});

			await useRoomServicesStore
				.getState()
				.deleteRoomService("room-1", "svc-remove");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(1);
			expect(roomServicesByRoomId["room-1"][0].serviceId).toBe("svc-keep");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "1",
							roomId: "room-1",
							serviceId: "svc-keep",
						}),
						mockRoomService({
							id: "2",
							roomId: "room-1",
							serviceId: "svc-remove",
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await useRoomServicesStore
				.getState()
				.deleteRoomService("room-1", "svc-remove");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(1);
			expect(roomServicesByRoomId["room-1"][0].serviceId).toBe("svc-keep");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/services/svc-remove",
				expect.objectContaining({
					method: "DELETE",
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						mockRoomService({
							id: "1",
							roomId: "room-1",
							serviceId: "svc-keep",
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRoomServicesStore.getState().deleteRoomService("room-1", "svc-keep"),
			).rejects.toThrow("Failed to remove room service");

			const { roomServicesByRoomId } = useRoomServicesStore.getState();
			expect(roomServicesByRoomId["room-1"]).toHaveLength(1);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [mockRoomService()],
				},
				isRoomServicesLoading: true,
				loadingRoomIds: ["room-1"],
				failedRoomIds: ["room-2"],
			});

			useRoomServicesStore.getState().clearStore();

			expect(useRoomServicesStore.getState().roomServicesByRoomId).toEqual({});
			expect(useRoomServicesStore.getState().isRoomServicesLoading).toBe(false);
			expect(useRoomServicesStore.getState().loadingRoomIds).toEqual([]);
			expect(useRoomServicesStore.getState().failedRoomIds).toEqual([]);
		});
	});
});
