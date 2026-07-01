import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useServicesStore } from "@/components/dashboard/services/store";
import { usePropertyServicesStore } from "./property-services-store";
import type { PropertyService } from "./types";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPropertyService = (
	overrides: Partial<PropertyService> = {},
): PropertyService => ({
	id: "test-uuid",
	propertyId: "prop-1",
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

describe("PropertyServicesStore", () => {
	beforeEach(() => {
		usePropertyServicesStore.setState({
			propertyServicesByPropertyId: {},
			isPropertyServicesLoading: false,
			fetchingPropertyId: null,
			isPropertyServicesFetchFailed: false,
		});
		useServicesStore.setState({
			services: [],
			isServicesLoading: false,
			hasServicesFetched: false,
			servicesFetchFailed: false,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("fetchPropertyServices", () => {
		it("seeds from global services when unauthenticated", async () => {
			await usePropertyServicesStore.getState().fetchPropertyServices("prop-1");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			const services = propertyServicesByPropertyId["prop-1"];
			expect(services).toHaveLength(2);
			expect(services[0].serviceName).toBe("Electricity");
			expect(services[0].serviceId).toBe("seed-electricity");
			expect(services[1].serviceName).toBe("Water");
			expect(services[1].serviceId).toBe("seed-water");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("skips seeding when property already has services in the store", async () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "existing",
							serviceName: "Existing",
						}),
					],
				},
			});

			await usePropertyServicesStore.getState().fetchPropertyServices("prop-1");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toHaveLength(1);
			expect(propertyServicesByPropertyId["prop-1"][0].serviceName).toBe(
				"Existing",
			);
		});

		it("fetches and sets property services when authenticated", async () => {
			authenticate();

			const mockServices = [
				mockPropertyService({
					id: "ps-1",
					serviceId: "svc-elec",
					serviceName: "Electricity",
				}),
				mockPropertyService({
					id: "ps-2",
					serviceId: "svc-water",
					serviceName: "Water",
				}),
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockServices,
			});

			await usePropertyServicesStore.getState().fetchPropertyServices("prop-1");

			const { propertyServicesByPropertyId, isPropertyServicesLoading } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toEqual(mockServices);
			expect(isPropertyServicesLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties/prop-1/services",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("stores empty property services when authenticated property has no services", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [],
			});

			await usePropertyServicesStore.getState().fetchPropertyServices("prop-1");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toHaveLength(0);
			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties/prop-1/services",
				expect.objectContaining({ method: "GET" }),
			);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				usePropertyServicesStore.getState().fetchPropertyServices("prop-1"),
			).rejects.toThrow("Failed to fetch property services");

			const { isPropertyServicesLoading, isPropertyServicesFetchFailed } =
				usePropertyServicesStore.getState();
			expect(isPropertyServicesLoading).toBe(false);
			expect(isPropertyServicesFetchFailed).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("prevents duplicate fetches when already loading", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce(new Promise(() => {}));

			usePropertyServicesStore.getState().fetchPropertyServices("prop-1");

			await usePropertyServicesStore.getState().fetchPropertyServices("prop-1");

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("addPropertyService", () => {
		it("adds service locally when unauthenticated", async () => {
			await usePropertyServicesStore
				.getState()
				.addPropertyService("prop-1", "svc-new", {
					serviceName: "New Service",
					unitLabel: "units",
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 50,
				});

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			const services = propertyServicesByPropertyId["prop-1"];
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

			const created = mockPropertyService({
				id: "server-id",
				propertyId: "prop-1",
				serviceId: "svc-new",
				serviceName: "Test",
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [created],
			});

			await usePropertyServicesStore
				.getState()
				.addPropertyService("prop-1", "svc-new", {
					serviceName: "Test",
					unitLabel: null,
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
				});

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toHaveLength(1);
			expect(propertyServicesByPropertyId["prop-1"][0]).toEqual(created);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties/prop-1/services",
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
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "existing",
							serviceId: "svc-existing",
						}),
					],
				},
			});

			await usePropertyServicesStore
				.getState()
				.addPropertyService("prop-1", "svc-existing", {
					serviceName: "Dup",
					unitLabel: null,
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
				});

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toHaveLength(1);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("handles API error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				usePropertyServicesStore
					.getState()
					.addPropertyService("prop-1", "svc-new", {
						serviceName: "Fail",
						unitLabel: null,
						pricingType: "flat",
						flatAmount: null,
						unitPrice: null,
					}),
			).rejects.toThrow("Failed to add property service");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toBeUndefined();
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("updatePropertyService", () => {
		it("updates service locally when unauthenticated", async () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "1",
							serviceId: "svc-1",
							serviceName: "Original",
						}),
						mockPropertyService({
							id: "2",
							serviceId: "svc-2",
							serviceName: "Second",
						}),
					],
				},
			});

			await usePropertyServicesStore
				.getState()
				.updatePropertyService("prop-1", "svc-1", {
					serviceName: "Updated",
				});

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"][0].serviceName).toBe(
				"Updated",
			);
			expect(propertyServicesByPropertyId["prop-1"][1].serviceName).toBe(
				"Second",
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "1",
							propertyId: "prop-1",
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

			await usePropertyServicesStore
				.getState()
				.updatePropertyService("prop-1", "svc-1", {
					serviceName: "Updated",
				});

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"][0].serviceName).toBe(
				"Updated",
			);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties/prop-1/services/svc-1",
				expect.objectContaining({
					method: "PATCH",
					body: JSON.stringify({ serviceName: "Updated" }),
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "1",
							propertyId: "prop-1",
							serviceId: "svc-1",
							serviceName: "Original",
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				usePropertyServicesStore
					.getState()
					.updatePropertyService("prop-1", "svc-1", {
						serviceName: "Updated",
					}),
			).rejects.toThrow("Failed to update property service");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"][0].serviceName).toBe(
				"Original",
			);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deletePropertyService", () => {
		it("removes service locally when unauthenticated", async () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "1",
							serviceId: "svc-keep",
						}),
						mockPropertyService({
							id: "2",
							serviceId: "svc-remove",
						}),
					],
				},
			});

			await usePropertyServicesStore
				.getState()
				.deletePropertyService("prop-1", "svc-remove");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toHaveLength(1);
			expect(propertyServicesByPropertyId["prop-1"][0].serviceId).toBe(
				"svc-keep",
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "1",
							propertyId: "prop-1",
							serviceId: "svc-keep",
						}),
						mockPropertyService({
							id: "2",
							propertyId: "prop-1",
							serviceId: "svc-remove",
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await usePropertyServicesStore
				.getState()
				.deletePropertyService("prop-1", "svc-remove");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toHaveLength(1);
			expect(propertyServicesByPropertyId["prop-1"][0].serviceId).toBe(
				"svc-keep",
			);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties/prop-1/services/svc-remove",
				expect.objectContaining({
					method: "DELETE",
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [
						mockPropertyService({
							id: "1",
							propertyId: "prop-1",
							serviceId: "svc-keep",
						}),
					],
				},
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				usePropertyServicesStore
					.getState()
					.deletePropertyService("prop-1", "svc-keep"),
			).rejects.toThrow("Failed to remove property service");

			const { propertyServicesByPropertyId } =
				usePropertyServicesStore.getState();
			expect(propertyServicesByPropertyId["prop-1"]).toHaveLength(1);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			usePropertyServicesStore.setState({
				propertyServicesByPropertyId: {
					"prop-1": [mockPropertyService()],
				},
				isPropertyServicesLoading: true,
				fetchingPropertyId: "prop-1",
				isPropertyServicesFetchFailed: true,
			});

			usePropertyServicesStore.getState().clearStore();

			expect(
				usePropertyServicesStore.getState().propertyServicesByPropertyId,
			).toEqual({});
			expect(
				usePropertyServicesStore.getState().isPropertyServicesLoading,
			).toBe(false);
			expect(usePropertyServicesStore.getState().fetchingPropertyId).toBeNull();
			expect(
				usePropertyServicesStore.getState().isPropertyServicesFetchFailed,
			).toBe(false);
		});
	});
});
