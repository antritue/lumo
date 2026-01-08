import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Room } from "./types";

interface RoomsState {
	// Domain data
	rooms: Room[];

	// Actions
	createRoom: (propertyId: string, name: string) => void;
	updateRoom: (id: string, name: string) => void;
	deleteRoom: (id: string) => void;

	// Selectors
	getRoomsByProperty: (propertyId: string) => Room[];
}

export const useRoomsStore = create<RoomsState>()(
	devtools(
		(set, get) => ({
			rooms: [],

			createRoom: (propertyId, name) =>
				set((state) => ({
					rooms: [
						...state.rooms,
						{
							id: crypto.randomUUID(),
							propertyId,
							name,
							createdAt: new Date(),
						},
					],
				})),

			updateRoom: (id, name) =>
				set((state) => ({
					rooms: state.rooms.map((room) =>
						room.id === id ? { ...room, name } : room,
					),
				})),

			deleteRoom: (id) =>
				set((state) => ({
					rooms: state.rooms.filter((room) => room.id !== id),
				})),

			getRoomsByProperty: (propertyId) =>
				get().rooms.filter((room) => room.propertyId === propertyId),
		}),
		{ name: "rooms" },
	),
);
