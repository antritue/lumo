"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Service } from "@/components/dashboard/services/types";
import type { PropertyService } from "./types";

const FALLBACK_SERVICES: Service[] = [
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
	{
		id: "seed-wifi",
		userId: "",
		name: "WiFi",
		unitLabel: null,
		pricingType: "flat",
		flatAmount: null,
		unitPrice: null,
	},
	{
		id: "seed-cleaning",
		userId: "",
		name: "Cleaning",
		unitLabel: null,
		pricingType: "flat",
		flatAmount: null,
		unitPrice: null,
	},
	{
		id: "seed-parking",
		userId: "",
		name: "Parking",
		unitLabel: null,
		pricingType: "flat",
		flatAmount: null,
		unitPrice: null,
	},
];

interface PropertyServicesState {
	propertyServicesByPropertyId: Record<string, PropertyService[]>;

	fetchPropertyServices: (propertyId: string) => void;
	addPropertyService: (propertyId: string, serviceId: string) => void;
	updatePropertyService: (
		propertyId: string,
		serviceId: string,
		data: {
			pricingType?: "flat" | "variable" | null;
			flatAmount?: number | null;
			unitPrice?: number | null;
		},
	) => void;
	removePropertyService: (propertyId: string, serviceId: string) => void;
	clearStore: () => void;
}

export const usePropertyServicesStore = create<PropertyServicesState>()(
	devtools(
		(set, get) => ({
			propertyServicesByPropertyId: {},

			fetchPropertyServices: (propertyId) => {
				const { propertyServicesByPropertyId } = get();
				if (propertyServicesByPropertyId[propertyId]) return;

				const seeded: PropertyService[] = FALLBACK_SERVICES.filter(
					(s) => s.id === "seed-electricity" || s.id === "seed-water",
				).map((s) => ({
					id: crypto.randomUUID(),
					propertyId,
					serviceId: s.id,
					pricingType: null,
					flatAmount: null,
					unitPrice: null,
				}));

				set({
					propertyServicesByPropertyId: {
						...propertyServicesByPropertyId,
						[propertyId]: seeded,
					},
				});
			},

			addPropertyService: (propertyId, serviceId) => {
				const { propertyServicesByPropertyId } = get();
				const current = propertyServicesByPropertyId[propertyId] ?? [];

				if (current.some((ps) => ps.serviceId === serviceId)) return;

				const newService: PropertyService = {
					id: crypto.randomUUID(),
					propertyId,
					serviceId,
					pricingType: null,
					flatAmount: null,
					unitPrice: null,
				};

				set({
					propertyServicesByPropertyId: {
						...propertyServicesByPropertyId,
						[propertyId]: [...current, newService],
					},
				});
			},

			updatePropertyService: (propertyId, serviceId, data) => {
				const { propertyServicesByPropertyId } = get();
				const current = propertyServicesByPropertyId[propertyId] ?? [];

				set({
					propertyServicesByPropertyId: {
						...propertyServicesByPropertyId,
						[propertyId]: current.map((ps) =>
							ps.serviceId === serviceId ? { ...ps, ...data } : ps,
						),
					},
				});
			},

			removePropertyService: (propertyId, serviceId) => {
				const { propertyServicesByPropertyId } = get();
				const current = propertyServicesByPropertyId[propertyId] ?? [];

				set({
					propertyServicesByPropertyId: {
						...propertyServicesByPropertyId,
						[propertyId]: current.filter((ps) => ps.serviceId !== serviceId),
					},
				});
			},

			clearStore: () => set({ propertyServicesByPropertyId: {} }),
		}),
		{ name: "property-services" },
	),
);
