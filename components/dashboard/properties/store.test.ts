import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "./store";

// Mock crypto.randomUUID
Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("PropertiesStore", () => {
	beforeEach(() => {
		usePropertiesStore.setState({
			properties: [],
			isLoading: false,
			hasFetched: false,
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
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			const mockProperties = [
				{
					id: "1",
					name: "Property 1",
					userId: "user-123",
				},
				{
					id: "2",
					name: "Property 2",
					userId: "user-123",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockProperties,
			});

			await usePropertiesStore.getState().fetchProperties();

			const { properties, isLoading } = usePropertiesStore.getState();
			expect(properties).toEqual(mockProperties);
			expect(isLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("handles fetch error gracefully", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({
				ok: false,
			});

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await usePropertiesStore.getState().fetchProperties();

			const { properties, isLoading } = usePropertiesStore.getState();
			expect(properties).toEqual([]);
			expect(isLoading).toBe(false);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("prevents duplicate fetches when already fetched", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			const mockProperties = [
				{
					id: "1",
					name: "Property 1",
					userId: "user-123",
					createdAt: "2026-01-01",
					updatedAt: "2026-01-01",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockProperties,
			});

			// First fetch
			await usePropertiesStore.getState().fetchProperties();
			expect(mockFetch).toHaveBeenCalledTimes(1);

			// Second fetch should be prevented
			await usePropertiesStore.getState().fetchProperties();
			expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
		});
	});

	describe("createProperty", () => {
		it("creates property locally when unauthenticated", async () => {
			await usePropertiesStore.getState().createProperty("Local Property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0]).toEqual({
				id: "test-uuid",
				name: "Local Property",
				userId: "",
			});
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			// Mock authenticated user
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			// Mock API response
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: "server-id", name: "Server Property" }),
			});

			await usePropertiesStore.getState().createProperty("Server Property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0]).toEqual({
				id: "server-id",
				name: "Server Property",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/properties",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ name: "Server Property" }),
				}),
			);
		});

		it("handles API error gracefully", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({
				ok: false,
			});

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await usePropertiesStore.getState().createProperty("Error Property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(0);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("updateProperty", () => {
		it("updates property locally when unauthenticated", async () => {
			// Setup local properties
			usePropertiesStore.setState({
				properties: [
					{ id: "1", userId: "user-1", name: "First" },
					{ id: "2", userId: "user-1", name: "Second" },
				],
			});

			await usePropertiesStore.getState().updateProperty("2", "Updated");

			const { properties } = usePropertiesStore.getState();
			expect(properties[0].name).toBe("First");
			expect(properties[1].name).toBe("Updated");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			// Mock authenticated user
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			usePropertiesStore.setState({
				properties: [
					{ id: "1", userId: "user-123", name: "Original" },
					{ id: "2", userId: "user-123", name: "Second" },
				],
			});

			// Mock API response
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: "1", name: "Updated", userId: "user-123" }),
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
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			usePropertiesStore.setState({
				properties: [{ id: "1", userId: "user-123", name: "Original" }],
			});

			mockFetch.mockResolvedValueOnce({
				ok: false,
			});

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await usePropertiesStore.getState().updateProperty("1", "Updated");

			const { properties } = usePropertiesStore.getState();
			expect(properties[0].name).toBe("Original"); // Property should not change after error
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deleteProperty", () => {
		it("deletes property locally when unauthenticated", async () => {
			usePropertiesStore.setState({
				properties: [
					{ id: "1", userId: "user-1", name: "Keep" },
					{ id: "2", userId: "user-1", name: "Delete" },
				],
			});

			await usePropertiesStore.getState().deleteProperty("2");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0].name).toBe("Keep");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			// Mock authenticated user
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			usePropertiesStore.setState({
				properties: [
					{ id: "1", userId: "user-123", name: "Keep" },
					{ id: "2", userId: "user-123", name: "Delete" },
				],
			});

			// Mock API response
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ id: "2", name: "Delete", userId: "user-123" }),
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
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			usePropertiesStore.setState({
				properties: [{ id: "1", userId: "user-123", name: "Property 1" }],
			});

			mockFetch.mockResolvedValueOnce({
				ok: false,
			});

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await usePropertiesStore.getState().deleteProperty("1");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1); // Property should still exist after error
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});
