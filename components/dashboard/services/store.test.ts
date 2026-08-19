import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useServicesStore } from "./store";
import type { Service } from "./types";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockService = (overrides: Partial<Service> = {}): Service => ({
	id: "test-uuid",
	userId: "",
	name: "Service",
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

describe("ServicesStore", () => {
	beforeEach(() => {
		useServicesStore.setState({
			services: [],
			isServicesLoading: false,
			hasServicesFetched: false,
			isServicesFetchFailed: false,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("fetchServices", () => {
		it("seeds default services when unauthenticated", async () => {
			await useServicesStore.getState().fetchServices();

			const { services, isServicesLoading } = useServicesStore.getState();
			expect(services).toHaveLength(2);
			expect(services[0].name).toBe("Electricity");
			expect(services[1].name).toBe("Water");
			expect(isServicesLoading).toBe(false);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("fetches and sets services when authenticated", async () => {
			authenticate();

			const mockServices = [
				mockService({ id: "1", name: "Electricity", userId: "user-123" }),
				mockService({ id: "2", name: "Water", userId: "user-123" }),
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockServices,
			});

			await useServicesStore.getState().fetchServices();

			const { services, isServicesLoading } = useServicesStore.getState();
			expect(services).toEqual(mockServices);
			expect(isServicesLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/services",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(useServicesStore.getState().fetchServices()).rejects.toThrow(
				"Failed to fetch services",
			);

			const {
				services,
				isServicesLoading,
				hasServicesFetched,
				isServicesFetchFailed,
			} = useServicesStore.getState();
			expect(services).toEqual([]);
			expect(isServicesLoading).toBe(false);
			expect(hasServicesFetched).toBe(false);
			expect(isServicesFetchFailed).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("prevents duplicate fetches when already fetched", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [mockService({ id: "1", name: "Electricity" })],
			});

			await useServicesStore.getState().fetchServices();
			expect(mockFetch).toHaveBeenCalledTimes(1);

			await useServicesStore.getState().fetchServices();
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("createService", () => {
		it("creates service locally when unauthenticated", async () => {
			await useServicesStore.getState().createService("WiFi");

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(1);
			expect(services[0]).toEqual(
				mockService({ name: "WiFi", pricingType: "variable" }),
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () =>
					mockService({ id: "server-id", name: "WiFi", userId: "user-123" }),
			});

			await useServicesStore.getState().createService("WiFi");

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(1);
			expect(services[0]).toEqual(
				mockService({ id: "server-id", name: "WiFi", userId: "user-123" }),
			);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/services",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({
						name: "WiFi",
						unitLabel: null,
						pricingType: "variable",
						flatAmount: null,
						unitPrice: null,
					}),
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useServicesStore.getState().createService("WiFi"),
			).rejects.toThrow("Failed to create service");

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(0);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("creates service with variable pricing", async () => {
			await useServicesStore
				.getState()
				.createService("Electricity", "kWh", "variable", null, 0.15);

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(1);
			expect(services[0]).toEqual(
				mockService({
					name: "Electricity",
					unitLabel: "kWh",
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 0.15,
				}),
			);
		});
	});

	describe("updateService", () => {
		it("updates service locally when unauthenticated", async () => {
			useServicesStore.setState({
				services: [
					mockService({ id: "1", name: "First" }),
					mockService({ id: "2", name: "Second" }),
				],
			});

			await useServicesStore.getState().updateService("2", "Updated");

			const { services } = useServicesStore.getState();
			expect(services[0].name).toBe("First");
			expect(services[1].name).toBe("Updated");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			useServicesStore.setState({
				services: [
					mockService({ id: "1", userId: "user-123", name: "Original" }),
					mockService({ id: "2", userId: "user-123", name: "Second" }),
				],
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () =>
					mockService({ id: "1", name: "Updated", userId: "user-123" }),
			});

			await useServicesStore.getState().updateService("1", "Updated");

			const { services } = useServicesStore.getState();
			expect(services[0].name).toBe("Updated");
			expect(services[1].name).toBe("Second");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/services/1",
				expect.objectContaining({
					method: "PATCH",
					body: JSON.stringify({
						name: "Updated",
						unitLabel: null,
						pricingType: "variable",
						flatAmount: null,
						unitPrice: null,
					}),
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			useServicesStore.setState({
				services: [
					mockService({ id: "1", userId: "user-123", name: "Original" }),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useServicesStore.getState().updateService("1", "Updated"),
			).rejects.toThrow("Failed to update service");

			const { services } = useServicesStore.getState();
			expect(services[0].name).toBe("Original");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deleteService", () => {
		it("deletes service locally when unauthenticated", async () => {
			useServicesStore.setState({
				services: [
					mockService({ id: "1", name: "Keep" }),
					mockService({ id: "2", name: "Delete" }),
				],
			});

			await useServicesStore.getState().deleteService("2");

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(1);
			expect(services[0].name).toBe("Keep");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			useServicesStore.setState({
				services: [
					mockService({ id: "1", userId: "user-123", name: "Keep" }),
					mockService({ id: "2", userId: "user-123", name: "Delete" }),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await useServicesStore.getState().deleteService("2");

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(1);
			expect(services[0].name).toBe("Keep");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/services/2",
				expect.objectContaining({
					method: "DELETE",
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			useServicesStore.setState({
				services: [
					mockService({ id: "1", userId: "user-123", name: "Service 1" }),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useServicesStore.getState().deleteService("1"),
			).rejects.toThrow("Failed to delete service");

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(1);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			useServicesStore.setState({
				services: [
					mockService({ id: "1", name: "Service 1" }),
					mockService({ id: "2", name: "Service 2" }),
				],
				isServicesLoading: true,
				hasServicesFetched: true,
				isServicesFetchFailed: true,
			});

			useServicesStore.getState().clearStore();

			expect(useServicesStore.getState().services).toEqual([]);
			expect(useServicesStore.getState().isServicesLoading).toBe(false);
			expect(useServicesStore.getState().hasServicesFetched).toBe(false);
			expect(useServicesStore.getState().isServicesFetchFailed).toBe(false);
		});
	});
});
