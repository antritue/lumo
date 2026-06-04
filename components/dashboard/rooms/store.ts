import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Room } from "./types";

interface RoomsState {
	rooms: Room[];
	isLoading: boolean;
	loadingPropertyIds: string[];

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
			loadingPropertyIds: [],

			fetchRoomsByPropertyId: async (propertyId) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { loadingPropertyIds } = get();
				if (loadingPropertyIds.includes(propertyId)) return;

				try {
					set((state) => ({
						isLoading: true,
						loadingPropertyIds: [...state.loadingPropertyIds, propertyId],
					}));
					const res = await fetch(`/api/rooms?propertyId=${propertyId}`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch rooms");
					}

					const data = await res.json();

					set((state) => {
						const newLoadingIds = state.loadingPropertyIds.filter(
							(id) => id !== propertyId,
						);
						return {
							rooms: [
								...state.rooms.filter((r) => r.propertyId !== propertyId),
								...data,
							],
							isLoading: newLoadingIds.length > 0,
							loadingPropertyIds: newLoadingIds,
						};
					});
				} catch (error) {
					console.error("Failed to fetch rooms:", error);
					set((state) => {
						const newLoadingIds = state.loadingPropertyIds.filter(
							(id) => id !== propertyId,
						);
						return {
							isLoading: newLoadingIds.length > 0,
							loadingPropertyIds: newLoadingIds,
						};
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
					isLoading: false,
					loadingPropertyIds: [],
				}),

			getRoomById: (id) => get().rooms.find((room) => room.id === id),
		}),
		{ name: "rooms" },
	),
);
