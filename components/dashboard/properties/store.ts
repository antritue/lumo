import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Property } from "./types";

interface PropertiesState {
	// Domain data
	properties: Property[];

	// Actions
	createProperty: (name: string) => void;
	updateProperty: (id: string, name: string) => void;
	deleteProperty: (id: string) => void;
}

export const usePropertiesStore = create<PropertiesState>()(
	devtools(
		(set, _get) => ({
			properties: [],

			createProperty: (name) =>
				set((state) => ({
					properties: [
						...state.properties,
						{
							id: crypto.randomUUID(),
							name,
						},
					],
				})),

			updateProperty: (id, name) =>
				set((state) => ({
					properties: state.properties.map((property) =>
						property.id === id ? { ...property, name } : property,
					),
				})),

			deleteProperty: (id) =>
				set((state) => ({
					properties: state.properties.filter((property) => property.id !== id),
				})),
		}),
		{ name: "properties" },
	),
);
