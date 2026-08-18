import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { RoomLimitReachedError, useRoomsStore } from "./store";
import type { Room } from "./types";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockRoom = (overrides: Partial<Room> = {}): Room => ({
	id: "test-uuid",
	propertyId: "prop-1",
	name: "Room",
	monthlyRent: null,
	notes: null,
	...overrides,
});

const authenticate = () => {
	useAuthStore.setState({ user: { id: "user-123" } as User });
};

const mockErrorConsole = () =>
	vi.spyOn(console, "error").mockImplementation(() => {});

describe("RoomsStore", () => {
	beforeEach(() => {
		useRoomsStore.setState({
			rooms: [],
			isRoomsLoading: false,
			fetchingPropertyId: null,
			fetchingRoomId: null,
			isRoomsFetchFailed: false,
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
			authenticate();

			const mockResponse = [
				mockRoom({ id: "r1", name: "Room 1", monthlyRent: 1000 }),
				mockRoom({ id: "r2", name: "Room 2", notes: "Corner unit" }),
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await useRoomsStore.getState().fetchRoomsByPropertyId("prop-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual(mockResponse);
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
			authenticate();

			useRoomsStore.setState({
				rooms: [
					mockRoom({ id: "old-1", name: "Old Room" }),
					mockRoom({ id: "other-1", propertyId: "prop-2", name: "Other Room" }),
				],
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [
					mockRoom({ id: "new-1", name: "New Room", monthlyRent: 500 }),
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
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRoomsStore.getState().fetchRoomsByPropertyId("prop-1"),
			).rejects.toThrow("Failed to fetch rooms");

			const { rooms, isRoomsLoading, isRoomsFetchFailed } =
				useRoomsStore.getState();
			expect(rooms).toEqual([]);
			expect(isRoomsLoading).toBe(false);
			expect(isRoomsFetchFailed).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("deduplicates concurrent fetches for the same property", async () => {
			authenticate();

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => [
					mockRoom({ id: "r1", name: "Room 1", monthlyRent: 1000 }),
				],
			});

			await Promise.all([
				useRoomsStore.getState().fetchRoomsByPropertyId("prop-1"),
				useRoomsStore.getState().fetchRoomsByPropertyId("prop-1"),
			]);

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it("fetches rooms for different properties sequentially", async () => {
			authenticate();

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						mockRoom({ id: "r1", name: "Room 1", monthlyRent: 1000 }),
					],
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						mockRoom({
							id: "r2",
							propertyId: "prop-2",
							name: "Room A",
							monthlyRent: 500,
						}),
					],
				});

			await useRoomsStore.getState().fetchRoomsByPropertyId("prop-1");
			await useRoomsStore.getState().fetchRoomsByPropertyId("prop-2");

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
			expect(rooms[0]).toEqual(mockRoom({ name: "Master Bedroom" }));
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
			authenticate();

			const serverRoom = mockRoom({
				id: "server-id",
				name: "Server Room",
				monthlyRent: 2000,
				notes: "Server notes",
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => serverRoom,
			});

			await useRoomsStore
				.getState()
				.createRoom("prop-1", "Server Room", 2000, "Server notes");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0]).toEqual(serverRoom);

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
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRoomsStore.getState().createRoom("prop-1", "Error Room"),
			).rejects.toThrow("Failed to create room");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(0);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("throws RoomLimitReachedError on a 403 response", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });

			await expect(
				useRoomsStore.getState().createRoom("prop-1", "Limit Room"),
			).rejects.toThrow(RoomLimitReachedError);

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(0);
		});
	});

	describe("updateRoom", () => {
		it("updates room locally when unauthenticated", async () => {
			useRoomsStore.setState({
				rooms: [
					mockRoom({ id: "1", name: "Room 1" }),
					mockRoom({ id: "2", name: "Room 2" }),
				],
			});

			await useRoomsStore.getState().updateRoom("2", "Updated");

			const { rooms } = useRoomsStore.getState();
			expect(rooms[0].name).toBe("Room 1");
			expect(rooms[1].name).toBe("Updated");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			useRoomsStore.setState({
				rooms: [
					mockRoom({
						id: "1",
						name: "Original",
						monthlyRent: 1000,
						notes: "Old notes",
					}),
					mockRoom({ id: "2", name: "Room 2" }),
				],
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () =>
					mockRoom({
						id: "1",
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
			authenticate();

			useRoomsStore.setState({
				rooms: [
					mockRoom({
						id: "1",
						name: "Original",
						monthlyRent: 1000,
						notes: "Old",
					}),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

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
					mockRoom({ id: "1", name: "Keep" }),
					mockRoom({ id: "2", name: "Delete" }),
				],
			});

			await useRoomsStore.getState().deleteRoom("2");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0].name).toBe("Keep");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and removes room when authenticated", async () => {
			authenticate();

			useRoomsStore.setState({
				rooms: [
					mockRoom({ id: "1", name: "Keep" }),
					mockRoom({ id: "2", name: "Delete" }),
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
			authenticate();

			useRoomsStore.setState({
				rooms: [mockRoom({ id: "1", name: "Room 1" })],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

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
			authenticate();

			const mockResponse = mockRoom({
				id: "room-1",
				name: "Master Bedroom",
				monthlyRent: 1200,
				notes: "Large room with balcony",
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await useRoomsStore.getState().fetchRoomById("room-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([mockResponse]);
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
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

			await useRoomsStore.getState().fetchRoomById("room-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([]);
			expect(isRoomsLoading).toBe(false);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await useRoomsStore.getState().fetchRoomById("room-1");

			const { rooms, isRoomsLoading } = useRoomsStore.getState();
			expect(rooms).toEqual([]);
			expect(isRoomsLoading).toBe(false);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("deduplicates concurrent fetches for the same room", async () => {
			authenticate();

			mockFetch.mockResolvedValue({
				ok: true,
				json: async () =>
					mockRoom({ id: "room-1", name: "Room 1", monthlyRent: 1000 }),
			});

			await Promise.all([
				useRoomsStore.getState().fetchRoomById("room-1"),
				useRoomsStore.getState().fetchRoomById("room-1"),
			]);

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it("fetches different rooms sequentially", async () => {
			authenticate();

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () =>
						mockRoom({ id: "room-1", name: "Room 1", monthlyRent: 1000 }),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () =>
						mockRoom({ id: "room-2", name: "Room 2", monthlyRent: 500 }),
				});

			await useRoomsStore.getState().fetchRoomById("room-1");
			await useRoomsStore.getState().fetchRoomById("room-2");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(2);
			expect(rooms.find((r) => r.id === "room-1")?.name).toBe("Room 1");
			expect(rooms.find((r) => r.id === "room-2")?.name).toBe("Room 2");
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});
	});

	describe("getRoomById", () => {
		it("returns room when found", () => {
			useRoomsStore.setState({
				rooms: [mockRoom({ id: "1", name: "Target Room", monthlyRent: 1500 })],
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
				rooms: [mockRoom({ id: "1", name: "Room 1", monthlyRent: 1500 })],
				isRoomsLoading: true,
				fetchingPropertyId: "prop-1",
				fetchingRoomId: "room-1",
				isRoomsFetchFailed: true,
			});

			useRoomsStore.getState().clearStore();

			const state = useRoomsStore.getState();
			expect(state.rooms).toEqual([]);
			expect(state.isRoomsLoading).toBe(false);
			expect(state.fetchingPropertyId).toBeNull();
			expect(state.fetchingRoomId).toBeNull();
			expect(state.isRoomsFetchFailed).toBe(false);
		});
	});
});
