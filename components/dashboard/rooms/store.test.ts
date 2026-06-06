import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useRoomsStore } from "./store";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("RoomsStore", () => {
	beforeEach(() => {
		useRoomsStore.setState({
			rooms: [],
			isRoomsLoading: false,
			loadingPropertyIds: [],
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("fetchRoomsByPropertyId", () => {
		it("does not fetch when unauthenticated", async () => {
			await useRoomsStore.getState().fetchRoomsByPropertyId("prop-1");

			expect(mockFetch).not.toHaveBeenCalled();
			expect(useRoomsStore.getState().isRoomsLoading).toBe(false);
		});

		it("fetches and sets rooms when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			const mockResponse = [
				{
					id: "r1",
					propertyId: "prop-1",
					name: "Room 1",
					monthlyRent: 1000,
					notes: null,
				},
				{
					id: "r2",
					propertyId: "prop-1",
					name: "Room 2",
					monthlyRent: null,
					notes: "Corner unit",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await useRoomsStore.getState().fetchRoomsByPropertyId("prop-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([
				{
					id: "r1",
					propertyId: "prop-1",
					name: "Room 1",
					monthlyRent: 1000,
					notes: null,
				},
				{
					id: "r2",
					propertyId: "prop-1",
					name: "Room 2",
					monthlyRent: null,
					notes: "Corner unit",
				},
			]);
			expect(isRoomsLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms?propertyId=prop-1",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("replaces existing rooms for the same property", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRoomsStore.setState({
				rooms: [
					{
						id: "old-1",
						propertyId: "prop-1",
						name: "Old Room",
						monthlyRent: null,
						notes: null,
					},
					{
						id: "other-1",
						propertyId: "prop-2",
						name: "Other Room",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					{
						id: "new-1",
						propertyId: "prop-1",
						name: "New Room",
						monthlyRent: 500,
						notes: null,
					},
				],
			});

			await useRoomsStore.getState().fetchRoomsByPropertyId("prop-1");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(2);
			expect(rooms.find((r) => r.propertyId === "prop-1")?.name).toBe(
				"New Room",
			);
			expect(rooms.find((r) => r.propertyId === "prop-2")?.name).toBe(
				"Other Room",
			);
		});

		it("handles fetch error gracefully", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useRoomsStore.getState().fetchRoomsByPropertyId("prop-1"),
			).rejects.toThrow("Failed to fetch rooms");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([]);
			expect(isRoomsLoading).toBe(false);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("fetches rooms for different properties independently", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						{
							id: "r1",
							propertyId: "prop-1",
							name: "Room 1",
							monthlyRent: 1000,
							notes: null,
						},
					],
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						{
							id: "r2",
							propertyId: "prop-2",
							name: "Room A",
							monthlyRent: 500,
							notes: null,
						},
					],
				});

			await Promise.all([
				useRoomsStore.getState().fetchRoomsByPropertyId("prop-1"),
				useRoomsStore.getState().fetchRoomsByPropertyId("prop-2"),
			]);

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(2);
			expect(rooms.find((r) => r.propertyId === "prop-1")?.name).toBe("Room 1");
			expect(rooms.find((r) => r.propertyId === "prop-2")?.name).toBe("Room A");
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});
	});

	describe("createRoom", () => {
		it("creates room locally when unauthenticated", async () => {
			await useRoomsStore.getState().createRoom("prop-1", "Master Bedroom");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0]).toEqual({
				id: "test-uuid",
				propertyId: "prop-1",
				name: "Master Bedroom",
				monthlyRent: null,
				notes: null,
			});
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("creates room locally with optional fields when unauthenticated", async () => {
			await useRoomsStore
				.getState()
				.createRoom("prop-1", "Suite", 1500, "Corner unit");

			const { rooms } = useRoomsStore.getState();
			expect(rooms[0]).toMatchObject({
				name: "Suite",
				monthlyRent: 1500,
				notes: "Corner unit",
			});
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: "server-id",
					propertyId: "prop-1",
					name: "Server Room",
					monthlyRent: 2000,
					notes: "Server notes",
				}),
			});

			await useRoomsStore
				.getState()
				.createRoom("prop-1", "Server Room", 2000, "Server notes");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0]).toEqual({
				id: "server-id",
				propertyId: "prop-1",
				name: "Server Room",
				monthlyRent: 2000,
				notes: "Server notes",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({
						name: "Server Room",
						propertyId: "prop-1",
						monthlyRent: 2000,
						notes: "Server notes",
					}),
				}),
			);
		});

		it("handles API error gracefully", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useRoomsStore.getState().createRoom("prop-1", "Error Room"),
			).rejects.toThrow("Failed to create room");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(0);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("updateRoom", () => {
		it("updates room locally when unauthenticated", async () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Room 1",
						monthlyRent: null,
						notes: null,
					},
					{
						id: "2",
						propertyId: "prop-1",
						name: "Room 2",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			await useRoomsStore.getState().updateRoom("2", "Updated");

			const { rooms } = useRoomsStore.getState();
			expect(rooms[0].name).toBe("Room 1");
			expect(rooms[1].name).toBe("Updated");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Original",
						monthlyRent: 1000,
						notes: "Old notes",
					},
					{
						id: "2",
						propertyId: "prop-1",
						name: "Room 2",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: "1",
					propertyId: "prop-1",
					name: "Updated",
					monthlyRent: 2000,
					notes: "New notes",
				}),
			});

			await useRoomsStore
				.getState()
				.updateRoom("1", "Updated", 2000, "New notes");

			const { rooms } = useRoomsStore.getState();
			expect(rooms[0].name).toBe("Updated");
			expect(rooms[0].monthlyRent).toBe(2000);
			expect(rooms[0].notes).toBe("New notes");
			expect(rooms[1].name).toBe("Room 2");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/1",
				expect.objectContaining({
					method: "PATCH",
					body: JSON.stringify({
						name: "Updated",
						monthlyRent: 2000,
						notes: "New notes",
					}),
				}),
			);
		});

		it("handles API error gracefully", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Original",
						monthlyRent: 1000,
						notes: "Old",
					},
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useRoomsStore.getState().updateRoom("1", "Updated", 2000, "New"),
			).rejects.toThrow("Failed to update room");

			const { rooms } = useRoomsStore.getState();
			expect(rooms[0].name).toBe("Original");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deleteRoom", () => {
		it("deletes room locally when unauthenticated", async () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Keep",
						monthlyRent: null,
						notes: null,
					},
					{
						id: "2",
						propertyId: "prop-1",
						name: "Delete",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			await useRoomsStore.getState().deleteRoom("2");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0].name).toBe("Keep");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and removes room when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Keep",
						monthlyRent: null,
						notes: null,
					},
					{
						id: "2",
						propertyId: "prop-1",
						name: "Delete",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await useRoomsStore.getState().deleteRoom("2");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0].name).toBe("Keep");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/2",
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

			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Room 1",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(useRoomsStore.getState().deleteRoom("1")).rejects.toThrow(
				"Failed to delete room",
			);

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("fetchRoomById", () => {
		it("does not fetch when unauthenticated", async () => {
			await useRoomsStore.getState().fetchRoomById("room-1");

			expect(mockFetch).not.toHaveBeenCalled();
			expect(useRoomsStore.getState().rooms).toEqual([]);
		});

		it("fetches and sets room when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			const mockRoom = {
				id: "room-1",
				propertyId: "prop-1",
				name: "Master Bedroom",
				monthlyRent: 1200,
				notes: "Large room with balcony",
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockRoom,
			});

			await useRoomsStore.getState().fetchRoomById("room-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([mockRoom]);
			expect(isRoomsLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("handles 404 response without adding to store", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

			await useRoomsStore.getState().fetchRoomById("room-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([]);
			expect(isRoomsLoading).toBe(false);
		});

		it("handles fetch error gracefully", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await useRoomsStore.getState().fetchRoomById("room-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([]);
			expect(isRoomsLoading).toBe(false);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("prevents concurrent duplicate fetches for the same room", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			const mockRoom = {
				id: "room-1",
				propertyId: "prop-1",
				name: "Master Bedroom",
				monthlyRent: 1200,
				notes: null,
			};

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => mockRoom,
			});

			await Promise.all([
				useRoomsStore.getState().fetchRoomById("room-1"),
				useRoomsStore.getState().fetchRoomById("room-1"),
			]);

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});

	describe("getRoomById", () => {
		it("returns room when found", () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Target Room",
						monthlyRent: 1500,
						notes: null,
					},
				],
			});

			const result = useRoomsStore.getState().getRoomById("1");

			expect(result?.name).toBe("Target Room");
			expect(result?.monthlyRent).toBe(1500);
		});

		it("returns undefined when not found", () => {
			const result = useRoomsStore.getState().getRoomById("fake-id");

			expect(result).toBeUndefined();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "prop-1",
						name: "Room 1",
						monthlyRent: 1500,
						notes: null,
					},
				],
				isRoomsLoading: true,
				loadingPropertyIds: ["prop-1"],
			});

			useRoomsStore.getState().clearStore();

			expect(useRoomsStore.getState().rooms).toEqual([]);
			expect(useRoomsStore.getState().isRoomsLoading).toBe(false);
			expect(useRoomsStore.getState().loadingPropertyIds).toEqual([]);
		});
	});
});
