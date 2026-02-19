import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Property } from "./types";

interface PropertiesState {
	// Domain data
	properties: Property[];
	isLoading: boolean;
	hasFetched: boolean;

	// Actions
	fetchProperties: () => Promise<void>;
	createProperty: (name: string) => void;
	updateProperty: (id: string, name: string) => void;
	deleteProperty: (id: string) => void;
}

export const usePropertiesStore = create<PropertiesState>()(
	devtools(
		(set, get) => ({
			properties: [],
			isLoading: false,
			hasFetched: false,

			fetchProperties: async () => {
				const { hasFetched, isLoading } = get();
				const user = useAuthStore.getState().user;

				// Prevent duplicate fetches
				if (!user || hasFetched || isLoading) {
					return;
				}

				try {
					set({ isLoading: true });
					const res = await fetch("/api/properties", {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch properties");
					}

					const data = await res.json();
					set({ properties: data, isLoading: false, hasFetched: true });
				} catch (error) {
					console.error("Failed to fetch properties:", error);
					set({ isLoading: false, hasFetched: true });
				}
			},

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
								userId: "",
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

			deleteProperty: async (id) => {
				const user = useAuthStore.getState().user;

				if (user) {
					try {
						const res = await fetch(`/api/properties/${id}`, {
							method: "DELETE",
							credentials: "include",
						});

						if (!res.ok) {
							throw new Error("Failed to delete property");
						}

						set((state) => ({
							properties: state.properties.filter(
								(property) => property.id !== id,
							),
						}));
					} catch (error) {
						console.error("Failed to delete property:", error);
						// Optional: You could show a toast here or handle error state
					}
				} else {
					set((state) => ({
						properties: state.properties.filter(
							(property) => property.id !== id,
						),
					}));
				}
			},
		}),
		{ name: "properties" },
	),
);
