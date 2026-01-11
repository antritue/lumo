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
		notes?: string | null,
	) => void;
	updateRoom: (
		id: string,
		name: string,
		monthlyRent?: number | null,
		notes?: string | null,
	) => void;
	deleteRoom: (id: string) => void;

	// Selectors
	getRoomById: (id: string) => Room | undefined;
}

export const useRoomsStore = create<RoomsState>()(
	devtools(
		(set, get) => ({
			rooms: [],

			createRoom: (propertyId, name, monthlyRent = null, notes = null) =>
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
				})),

			updateRoom: (id, name, monthlyRent, notes) =>
				set((state) => ({
					rooms: state.rooms.map((room) =>
						room.id === id
							? {
									...room,
									name,
									...(monthlyRent !== undefined && { monthlyRent }),
									...(notes !== undefined && { notes }),
								}
							: room,
					),
				})),

			deleteRoom: (id) =>
				set((state) => ({
					rooms: state.rooms.filter((room) => room.id !== id),
				})),

			getRoomById: (id) => get().rooms.find((room) => room.id === id),
		}),
		{ name: "rooms" },
	),
);
