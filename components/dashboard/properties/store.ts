import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Property } from "./types";

interface PropertiesState {
	// Domain data
	properties: Property[];

	// Loading state
	isPropertiesLoading: boolean; // true while any property fetch is in-flight
	hasPropertiesFetched: boolean; // dedup: prevents duplicate fetches after initial load
	propertiesFetchFailed: boolean; // true if property fetching failed

	// Actions
	fetchProperties: () => Promise<void>;
	createProperty: (name: string) => Promise<void>;
	updateProperty: (id: string, name: string) => void;
	deleteProperty: (id: string) => void;
	clearStore: () => void;
}

export const usePropertiesStore = create<PropertiesState>()(
	devtools(
		(set, get) => ({
			properties: [],
			isPropertiesLoading: false,
			hasPropertiesFetched: false,
			propertiesFetchFailed: false,

			fetchProperties: async () => {
				const { hasPropertiesFetched, isPropertiesLoading } = get();
				const user = useAuthStore.getState().user;

				if (!user || hasPropertiesFetched || isPropertiesLoading) {
					return;
				}

				try {
					set({ isPropertiesLoading: true });
					const res = await fetch("/api/properties", {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch properties");
					}

					const data = await res.json();
					set({
						properties: data,
						isPropertiesLoading: false,
						hasPropertiesFetched: true,
						propertiesFetchFailed: false,
					});
				} catch (error) {
					console.error("Failed to fetch properties:", error);
					set({
						isPropertiesLoading: false,
						hasPropertiesFetched: false,
						propertiesFetchFailed: true,
					});
					throw error;
				}
			},

			createProperty: async (name) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch("/api/properties", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name }),
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to create property");
						console.error("Failed to create property:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						properties: [data, ...state.properties],
					}));
				} else {
					set((state) => ({
						properties: [
							{
								id: crypto.randomUUID(),
								userId: "",
								name,
							},
							...state.properties,
						],
					}));
				}
			},

			updateProperty: async (id, name) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/properties/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name }),
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to update property");
						console.error("Failed to update property:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						properties: state.properties.map((property) =>
							property.id === id ? data : property,
						),
					}));
				} else {
					set((state) => ({
						properties: state.properties.map((property) =>
							property.id === id ? { ...property, name } : property,
						),
					}));
				}
			},

			deleteProperty: async (id) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/properties/${id}`, {
						method: "DELETE",
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to delete property");
						console.error("Failed to delete property:", error);
						throw error;
					}
				}

				set((state) => ({
					properties: state.properties.filter((property) => property.id !== id),
				}));
			},

			clearStore: () =>
				set({
					properties: [],
					isPropertiesLoading: false,
					hasPropertiesFetched: false,
					propertiesFetchFailed: false,
				}),
		}),
		{ name: "properties" },
	),
);
