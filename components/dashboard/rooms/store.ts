import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Room } from "./types";

function mapRoomResponse(data: Record<string, unknown>): Room {
	return {
		id: data.id as string,
		propertyId: data.property_id as string,
		name: data.name as string,
		monthlyRent: (data.monthly_rent as number) ?? null,
		notes: (data.notes as string) ?? null,
	};
}

interface RoomsState {
	rooms: Room[];
	isLoading: boolean;

	fetchRoomsByPropertyId: (propertyId: string) => Promise<void>;
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
			isLoading: false,

			fetchRoomsByPropertyId: async (propertyId) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { isLoading } = get();
				if (isLoading) return;

				try {
					set({ isLoading: true });
					const res = await fetch(`/api/rooms?property_id=${propertyId}`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch rooms");
					}

					const data = await res.json();
					const rooms = data.map(mapRoomResponse);

					set((state) => ({
						rooms: [
							...state.rooms.filter((r) => r.propertyId !== propertyId),
							...rooms,
						],
						isLoading: false,
					}));
				} catch (error) {
					console.error("Failed to fetch rooms:", error);
					set({ isLoading: false });
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
					try {
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
							throw new Error("Failed to create room");
						}

						const data = await res.json();
						const room = mapRoomResponse(data);

						set((state) => ({
							rooms: [...state.rooms, room],
						}));
					} catch (error) {
						console.error("Failed to create room:", error);
						throw error;
					}
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
					try {
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
							throw new Error("Failed to update room");
						}

						const data = await res.json();
						const room = mapRoomResponse(data);

						set((state) => ({
							rooms: state.rooms.map((r) => (r.id === id ? room : r)),
						}));
					} catch (error) {
						console.error("Failed to update room:", error);
					}
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
					try {
						const res = await fetch(`/api/rooms/${id}`, {
							method: "DELETE",
							credentials: "include",
						});

						if (!res.ok) {
							throw new Error("Failed to delete room");
						}

						set((state) => ({
							rooms: state.rooms.filter((room) => room.id !== id),
						}));
					} catch (error) {
						console.error("Failed to delete room:", error);
					}
				} else {
					set((state) => ({
						rooms: state.rooms.filter((room) => room.id !== id),
					}));
				}
			},

			clearStore: () =>
				set({
					rooms: [],
					isLoading: false,
				}),

			getRoomById: (id) => get().rooms.find((room) => room.id === id),
		}),
		{ name: "rooms" },
	),
);
