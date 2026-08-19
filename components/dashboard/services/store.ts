import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Service } from "./types";

const SEEDED_SERVICES: Service[] = [
	{
		id: "seed-electricity",
		userId: "",
		name: "Electricity",
		unitLabel: "kWh",
		pricingType: "variable",
		flatAmount: null,
		unitPrice: null,
	},
	{
		id: "seed-water",
		userId: "",
		name: "Water",
		unitLabel: "m³",
		pricingType: "variable",
		flatAmount: null,
		unitPrice: null,
	},
];

const HINTS = [
	{ name: "Electricity", pricingType: "variable", unitLabel: "kWh" },
	{ name: "Water", pricingType: "variable", unitLabel: "m³" },
	{ name: "WiFi", pricingType: "flat", unitLabel: null },
	{ name: "Cleaning", pricingType: "flat", unitLabel: null },
	{ name: "Parking", pricingType: "variable", unitLabel: "vehicle" },
] as const;

interface ServicesState {
	services: Service[];
	isServicesLoading: boolean;
	hasServicesFetched: boolean;
	isServicesFetchFailed: boolean;

	fetchServices: () => Promise<void>;
	createService: (
		name: string,
		unitLabel?: string | null,
		pricingType?: "flat" | "variable",
		flatAmount?: number | null,
		unitPrice?: number | null,
	) => Promise<void>;
	updateService: (
		id: string,
		name: string,
		unitLabel?: string | null,
		pricingType?: "flat" | "variable",
		flatAmount?: number | null,
		unitPrice?: number | null,
	) => Promise<void>;
	deleteService: (id: string) => Promise<void>;
	clearStore: () => void;
}

export const useServicesStore = create<ServicesState>()(
	devtools(
		(set, get) => ({
			services: [],
			isServicesLoading: false,
			hasServicesFetched: false,
			isServicesFetchFailed: false,

			fetchServices: async () => {
				const { hasServicesFetched, isServicesLoading } = get();
				if (hasServicesFetched || isServicesLoading) return;

				const user = useAuthStore.getState().user;

				if (!user) {
					set({
						services: SEEDED_SERVICES,
						isServicesLoading: false,
						hasServicesFetched: true,
						isServicesFetchFailed: false,
					});
					return;
				}

				try {
					set({ isServicesLoading: true });
					const res = await fetch("/api/services", {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch services");
					}

					const data: Service[] = await res.json();
					set({
						services: data,
						isServicesLoading: false,
						hasServicesFetched: true,
						isServicesFetchFailed: false,
					});
				} catch (error) {
					console.error("Failed to fetch services:", error);
					set({
						isServicesLoading: false,
						hasServicesFetched: false,
						isServicesFetchFailed: true,
					});
					throw error;
				}
			},

			createService: async (
				name,
				unitLabel = null,
				pricingType = "variable",
				flatAmount = null,
				unitPrice = null,
			) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch("/api/services", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name,
							unitLabel,
							pricingType,
							flatAmount,
							unitPrice,
						}),
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to create service");
						console.error("Failed to create service:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						services: [...state.services, data],
					}));
				} else {
					set((state) => ({
						services: [
							...state.services,
							{
								id: crypto.randomUUID(),
								userId: "",
								name,
								unitLabel,
								pricingType,
								flatAmount,
								unitPrice,
							},
						],
					}));
				}
			},

			updateService: async (
				id,
				name,
				unitLabel = null,
				pricingType = "variable",
				flatAmount = null,
				unitPrice = null,
			) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/services/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name,
							unitLabel,
							pricingType,
							flatAmount,
							unitPrice,
						}),
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to update service");
						console.error("Failed to update service:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						services: state.services.map((service) =>
							service.id === id ? data : service,
						),
					}));
				} else {
					set((state) => ({
						services: state.services.map((service) =>
							service.id === id
								? {
										...service,
										name,
										unitLabel,
										pricingType,
										flatAmount,
										unitPrice,
									}
								: service,
						),
					}));
				}
			},

			deleteService: async (id) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/services/${id}`, {
						method: "DELETE",
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to delete service");
						console.error("Failed to delete service:", error);
						throw error;
					}
				}

				set((state) => ({
					services: state.services.filter((service) => service.id !== id),
				}));
			},

			clearStore: () =>
				set({
					services: [],
					isServicesLoading: false,
					hasServicesFetched: false,
					isServicesFetchFailed: false,
				}),
		}),
		{ name: "services" },
	),
);

export { HINTS };
