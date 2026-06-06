import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "./store";
import type { Property } from "./types";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockProperty = (overrides: Partial<Property> = {}): Property => ({
	id: "test-uuid",
	name: "Property",
	userId: "",
	...overrides,
});

const authenticate = () => {
	useAuthStore.setState({ user: { id: "user-123" } as User });
};

const mockErrorConsole = () =>
	vi.spyOn(console, "error").mockImplementation(() => {});

describe("PropertiesStore", () => {
	beforeEach(() => {
		usePropertiesStore.setState({
			properties: [],
			isPropertiesLoading: false,
			hasPropertiesFetched: false,
			propertiesFetchFailed: false,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("fetchProperties", () => {
		it("does not fetch when unauthenticated", async () => {
			await usePropertiesStore.getState().fetchProperties();

			expect(mockFetch).not.toHaveBeenCalled();
			expect(usePropertiesStore.getState().properties).toEqual([]);
		});

		it("fetches and sets properties when authenticated", async () => {
			authenticate();

			const mockProperties = [
				mockProperty({ id: "1", name: "Property 1", userId: "user-123" }),
				mockProperty({ id: "2", name: "Property 2", userId: "user-123" }),
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockProperties,
			});

			await usePropertiesStore.getState().fetchProperties();

			const { properties, isPropertiesLoading } = usePropertiesStore.getState();
			expect(properties).toEqual(mockProperties);
			expect(isPropertiesLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties",
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

			await expect(
				usePropertiesStore.getState().fetchProperties(),
			).rejects.toThrow("Failed to fetch properties");

			const {
				properties,
				isPropertiesLoading,
				hasPropertiesFetched,
				propertiesFetchFailed,
			} = usePropertiesStore.getState();
			expect(properties).toEqual([]);
			expect(isPropertiesLoading).toBe(false);
			expect(hasPropertiesFetched).toBe(false);
			expect(propertiesFetchFailed).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("prevents duplicate fetches when already fetched", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [mockProperty({ id: "1", name: "Property 1" })],
			});

			await usePropertiesStore.getState().fetchProperties();
			expect(mockFetch).toHaveBeenCalledTimes(1);

			await usePropertiesStore.getState().fetchProperties();
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("createProperty", () => {
		it("creates property locally when unauthenticated", async () => {
			await usePropertiesStore.getState().createProperty("Local Property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0]).toEqual(mockProperty({ name: "Local Property" }));
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () =>
					mockProperty({ id: "server-id", name: "Server Property" }),
			});

			await usePropertiesStore.getState().createProperty("Server Property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0]).toEqual(
				mockProperty({ id: "server-id", name: "Server Property" }),
			);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ name: "Server Property" }),
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				usePropertiesStore.getState().createProperty("Error Property"),
			).rejects.toThrow("Failed to create property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(0);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("updateProperty", () => {
		it("updates property locally when unauthenticated", async () => {
			usePropertiesStore.setState({
				properties: [
					mockProperty({ id: "1", userId: "user-1", name: "First" }),
					mockProperty({ id: "2", userId: "user-1", name: "Second" }),
				],
			});

			await usePropertiesStore.getState().updateProperty("2", "Updated");

			const { properties } = usePropertiesStore.getState();
			expect(properties[0].name).toBe("First");
			expect(properties[1].name).toBe("Updated");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			usePropertiesStore.setState({
				properties: [
					mockProperty({ id: "1", userId: "user-123", name: "Original" }),
					mockProperty({ id: "2", userId: "user-123", name: "Second" }),
				],
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () =>
					mockProperty({ id: "1", name: "Updated", userId: "user-123" }),
			});

			await usePropertiesStore.getState().updateProperty("1", "Updated");

			const { properties } = usePropertiesStore.getState();
			expect(properties[0].name).toBe("Updated");
			expect(properties[1].name).toBe("Second");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties/1",
				expect.objectContaining({
					method: "PATCH",
					body: JSON.stringify({ name: "Updated" }),
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			usePropertiesStore.setState({
				properties: [
					mockProperty({ id: "1", userId: "user-123", name: "Original" }),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				usePropertiesStore.getState().updateProperty("1", "Updated"),
			).rejects.toThrow("Failed to update property");

			const { properties } = usePropertiesStore.getState();
			expect(properties[0].name).toBe("Original");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deleteProperty", () => {
		it("deletes property locally when unauthenticated", async () => {
			usePropertiesStore.setState({
				properties: [
					mockProperty({ id: "1", userId: "user-1", name: "Keep" }),
					mockProperty({ id: "2", userId: "user-1", name: "Delete" }),
				],
			});

			await usePropertiesStore.getState().deleteProperty("2");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0].name).toBe("Keep");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			usePropertiesStore.setState({
				properties: [
					mockProperty({ id: "1", userId: "user-123", name: "Keep" }),
					mockProperty({ id: "2", userId: "user-123", name: "Delete" }),
				],
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () =>
					mockProperty({ id: "2", name: "Delete", userId: "user-123" }),
			});

			await usePropertiesStore.getState().deleteProperty("2");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0].name).toBe("Keep");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties/2",
				expect.objectContaining({
					method: "DELETE",
					credentials: "include",
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			usePropertiesStore.setState({
				properties: [
					mockProperty({ id: "1", userId: "user-123", name: "Property 1" }),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				usePropertiesStore.getState().deleteProperty("1"),
			).rejects.toThrow("Failed to delete property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			usePropertiesStore.setState({
				properties: [
					mockProperty({ id: "1", userId: "user-123", name: "Property 1" }),
					mockProperty({ id: "2", userId: "user-123", name: "Property 2" }),
				],
				isPropertiesLoading: true,
				hasPropertiesFetched: true,
				propertiesFetchFailed: true,
			});

			usePropertiesStore.getState().clearStore();

			expect(usePropertiesStore.getState().properties).toEqual([]);
			expect(usePropertiesStore.getState().isPropertiesLoading).toBe(false);
			expect(usePropertiesStore.getState().hasPropertiesFetched).toBe(false);
			expect(usePropertiesStore.getState().propertiesFetchFailed).toBe(false);
		});
	});
});
