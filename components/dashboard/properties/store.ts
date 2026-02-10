import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
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

			createProperty: async (name) => {
				const user = useAuthStore.getState().user;

				if (user) {
					try {
						const res = await fetch("/api/properties", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ name }),
							credentials: "include",
						});

						if (!res.ok) {
							throw new Error("Failed to create property");
						}

						const data = await res.json();

						set((state) => ({
							properties: [...state.properties, data],
						}));
					} catch (error) {
						console.error("Failed to create property:", error);
						// Optional: You could show a toast here or handle error state
					}
				} else {
					set((state) => ({
						properties: [
							...state.properties,
							{
								id: crypto.randomUUID(),
								name,
							},
						],
					}));
				}
			},

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
