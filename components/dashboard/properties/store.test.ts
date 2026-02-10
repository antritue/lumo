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
		usePropertiesStore.setState({ properties: [] });
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("createProperty", () => {
		it("creates property locally when unauthenticated", async () => {
			await usePropertiesStore.getState().createProperty("Local Property");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0]).toEqual({
				id: "test-uuid",
				name: "Local Property",
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

	it("updates target property only", () => {
		// Setup local properties
		usePropertiesStore.setState({
			properties: [
				{ id: "1", name: "First" },
				{ id: "2", name: "Second" },
			],
		});

		usePropertiesStore.getState().updateProperty("2", "Updated");

		const { properties } = usePropertiesStore.getState();
		expect(properties[0].name).toBe("First");
		expect(properties[1].name).toBe("Updated");
	});

	it("deletes target property only", () => {
		usePropertiesStore.setState({
			properties: [
				{ id: "1", name: "Keep" },
				{ id: "2", name: "Delete" },
			],
		});

		usePropertiesStore.getState().deleteProperty("2");

		const { properties } = usePropertiesStore.getState();
		expect(properties).toHaveLength(1);
		expect(properties[0].name).toBe("Keep");
	});
});
