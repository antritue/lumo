import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Room } from "./types";

export class RoomLimitReachedError extends Error {
	constructor() {
		super("Room limit reached");
		this.name = "RoomLimitReachedError";
	}
}

interface RoomsState {
	rooms: Room[];
	isRoomsLoading: boolean;
	isRoomsFetchFailed: boolean;
	fetchingPropertyId: string | null; // dedup: prevents duplicate room fetches for the same property (StrictMode, auto-select, etc.)
	fetchingRoomId: string | null; // dedup: prevents duplicate room fetches for the same room (StrictMode)

	// Actions
	fetchRoomsByPropertyId: (propertyId: string) => Promise<void>;
	fetchRoomById: (roomId: string) => Promise<void>;
	createRoom: (
		propertyId: string,
		name: string,
		monthlyRent?: number | null,
		notes?: string | null,
	) => Promise<void>;
	updateRoom: (
		id: string,
		name: string,
		monthlyRent?: number | null,
		notes?: string | null,
	) => Promise<void>;
	deleteRoom: (id: string) => Promise<void>;
	clearStore: () => void;

	getRoomById: (id: string) => Room | undefined;
}

export const useRoomsStore = create<RoomsState>()(
	devtools(
		(set, get) => ({
			rooms: [],
			isRoomsLoading: false,
			fetchingPropertyId: null,
			fetchingRoomId: null,
			isRoomsFetchFailed: false,

			fetchRoomById: async (roomId) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { fetchingRoomId } = get();
				if (fetchingRoomId === roomId) return;

				try {
					set({ isRoomsLoading: true, fetchingRoomId: roomId });
					const res = await fetch(`/api/rooms/${roomId}`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						if (res.status === 404) {
							set({ isRoomsLoading: false, fetchingRoomId: null });
							return;
						}
						throw new Error("Failed to fetch room");
					}

					const data = await res.json();

					set((state) => ({
						rooms: state.rooms.some((r) => r.id === roomId)
							? state.rooms.map((r) => (r.id === roomId ? data : r))
							: [...state.rooms, data],
						isRoomsLoading: false,
						fetchingRoomId: null,
					}));
				} catch (error) {
					console.error("Failed to fetch room:", error);
					set({ isRoomsLoading: false, fetchingRoomId: null });
				}
			},

			fetchRoomsByPropertyId: async (propertyId) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { fetchingPropertyId } = get();
				if (fetchingPropertyId === propertyId) return;

				try {
					set({
						isRoomsLoading: true,
						fetchingPropertyId: propertyId,
						isRoomsFetchFailed: false,
					});
					const res = await fetch(`/api/rooms?propertyId=${propertyId}`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch rooms");
					}

					const data = await res.json();

					set((state) => ({
						rooms: [
							...state.rooms.filter((r) => r.propertyId !== propertyId),
							...data,
						],
						isRoomsLoading: false,
						fetchingPropertyId: null,
					}));
				} catch (error) {
					console.error("Failed to fetch rooms:", error);
					set({
						isRoomsLoading: false,
						fetchingPropertyId: null,
						isRoomsFetchFailed: true,
					});
					throw error;
				}
			},

			createRoom: async (
				propertyId,
				name,
				monthlyRent = null,
				notes = null,
			) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch("/api/rooms", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name,
							propertyId,
							monthlyRent,
							notes,
						}),
						credentials: "include",
					});

					if (!res.ok) {
						if (res.status === 403) {
							throw new RoomLimitReachedError();
						}
						const error = new Error("Failed to create room");
						console.error("Failed to create room:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						rooms: [...state.rooms, data],
					}));
				} else {
					set((state) => ({
						rooms: [
							...state.rooms,
							{
								id: crypto.randomUUID(),
								propertyId,
								name,
								monthlyRent,
								notes,
							},
						],
					}));
				}
			},

			updateRoom: async (id, name, monthlyRent, notes) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const body: Record<string, unknown> = { name };
					if (monthlyRent !== undefined) body.monthlyRent = monthlyRent;
					if (notes !== undefined) body.notes = notes;

					const res = await fetch(`/api/rooms/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(body),
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to update room");
						console.error("Failed to update room:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						rooms: state.rooms.map((r) => (r.id === id ? data : r)),
					}));
				} else {
					set((state) => ({
						rooms: state.rooms.map((room) =>
							room.id === id
								? {
										...room,
										name,
										...(monthlyRent !== undefined && {
											monthlyRent,
										}),
										...(notes !== undefined && { notes }),
									}
								: room,
						),
					}));
				}
			},

			deleteRoom: async (id) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/rooms/${id}`, {
						method: "DELETE",
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to delete room");
						console.error("Failed to delete room:", error);
						throw error;
					}
				}

				set((state) => ({
					rooms: state.rooms.filter((room) => room.id !== id),
				}));
			},

			clearStore: () =>
				set({
					rooms: [],
					isRoomsLoading: false,
					fetchingPropertyId: null,
					fetchingRoomId: null,
					isRoomsFetchFailed: false,
				}),

			getRoomById: (id) => get().rooms.find((room) => room.id === id),
		}),
		{ name: "rooms" },
	),
);
