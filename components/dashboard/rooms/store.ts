import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Room } from "./types";

interface RoomsState {
	// Domain data
	rooms: Room[];

	// Actions
	createRoom: (
		propertyId: string,
		name: string,
		monthlyRent?: number | null,
	) => void;
	updateRoom: (id: string, name: string, monthlyRent?: number | null) => void;
	deleteRoom: (id: string) => void;

	// Selectors
	getRoomsByProperty: (propertyId: string) => Room[];
	getRoomById: (id: string) => Room | undefined;
}

export const useRoomsStore = create<RoomsState>()(
	devtools(
		(set, get) => ({
			rooms: [],

			createRoom: (propertyId, name, monthlyRent = null) =>
				set((state) => ({
					rooms: [
						...state.rooms,
						{
							id: crypto.randomUUID(),
							propertyId,
							name,
							monthlyRent,
							createdAt: new Date(),
						},
					],
				})),

			updateRoom: (id, name, monthlyRent) =>
				set((state) => ({
					rooms: state.rooms.map((room) =>
						room.id === id
							? {
									...room,
									name,
									...(monthlyRent !== undefined && { monthlyRent }),
								}
							: room,
					),
				})),

			deleteRoom: (id) =>
				set((state) => ({
					rooms: state.rooms.filter((room) => room.id !== id),
				})),

			getRoomsByProperty: (propertyId) =>
				get().rooms.filter((room) => room.propertyId === propertyId),

			getRoomById: (id) => get().rooms.find((room) => room.id === id),
		}),
		{ name: "rooms" },
	),
);
