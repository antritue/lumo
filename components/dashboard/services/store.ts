import { create } from "zustand";
import { devtools } from "zustand/middleware";
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

const HINT_SERVICES = ["WiFi", "Cleaning", "Parking"] as const;

interface ServicesState {
	services: Service[];
	isServicesLoading: boolean;
	hasServicesFetched: boolean;
	servicesFetchFailed: boolean;

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
			servicesFetchFailed: false,

			fetchServices: async () => {
				const { hasServicesFetched, isServicesLoading } = get();

				if (hasServicesFetched || isServicesLoading) {
					return;
				}

				try {
					set({ isServicesLoading: true });
					await new Promise((r) => setTimeout(r, 300));
					set({
						services: SEEDED_SERVICES,
						isServicesLoading: false,
						hasServicesFetched: true,
						servicesFetchFailed: false,
					});
				} catch (error) {
					console.error("Failed to fetch services:", error);
					set({
						isServicesLoading: false,
						hasServicesFetched: false,
						servicesFetchFailed: true,
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
				set((state) => ({
					services: [
						...state.services,
						{
							id: crypto.randomUUID(),
							userId: "",
							name,
							unitLabel: unitLabel ?? null,
							pricingType,
							flatAmount,
							unitPrice,
						},
					],
				}));
			},

			updateService: async (
				id,
				name,
				unitLabel = null,
				pricingType = "variable",
				flatAmount = null,
				unitPrice = null,
			) => {
				set((state) => ({
					services: state.services.map((service) =>
						service.id === id
							? {
									...service,
									name,
									unitLabel: unitLabel ?? null,
									pricingType,
									flatAmount,
									unitPrice,
								}
							: service,
					),
				}));
			},

			deleteService: async (id) => {
				set((state) => ({
					services: state.services.filter((service) => service.id !== id),
				}));
			},

			clearStore: () =>
				set({
					services: [],
					isServicesLoading: false,
					hasServicesFetched: false,
					servicesFetchFailed: false,
				}),
		}),
		{ name: "services" },
	),
);

export { HINT_SERVICES };
