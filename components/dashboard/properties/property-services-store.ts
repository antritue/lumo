import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useServicesStore } from "@/components/dashboard/services/store";
import type { PropertyService } from "./types";

interface PropertyServicesState {
	propertyServicesByPropertyId: Record<string, PropertyService[]>;
	isPropertyServicesLoading: boolean;
	loadingPropertyIds: string[];
	failedPropertyIds: string[];

	fetchPropertyServices: (propertyId: string) => Promise<void>;
	addPropertyService: (
		propertyId: string,
		serviceId: string,
		data: {
			serviceName: string;
			unitLabel: string | null;
			pricingType: "flat" | "variable";
			flatAmount: number | null;
			unitPrice: number | null;
		},
	) => Promise<void>;
	updatePropertyService: (
		propertyId: string,
		serviceId: string,
		data: {
			pricingType?: "flat" | "variable";
			flatAmount?: number | null;
			unitPrice?: number | null;
			serviceName?: string;
			unitLabel?: string | null;
		},
	) => Promise<void>;
	deletePropertyService: (
		propertyId: string,
		serviceId: string,
	) => Promise<void>;
	clearStore: () => void;
}

export const usePropertyServicesStore = create<PropertyServicesState>()(
	devtools(
		(set, get) => ({
			propertyServicesByPropertyId: {},
			isPropertyServicesLoading: false,
			loadingPropertyIds: [],
			failedPropertyIds: [],

			fetchPropertyServices: async (propertyId) => {
				const user = useAuthStore.getState().user;

				if (!user) {
					const { propertyServicesByPropertyId } = get();
					if (propertyServicesByPropertyId[propertyId]) return;

					await useServicesStore.getState().fetchServices();
					const globalServices = useServicesStore.getState().services;

					const seeded: PropertyService[] = globalServices.map(
						(globalService) => ({
							id: crypto.randomUUID(),
							propertyId,
							serviceId: globalService.id,
							serviceName: globalService.name,
							unitLabel: globalService.unitLabel,
							pricingType: globalService.pricingType,
							flatAmount: globalService.flatAmount,
							unitPrice: globalService.unitPrice,
						}),
					);

					set((state) => ({
						propertyServicesByPropertyId: {
							...state.propertyServicesByPropertyId,
							[propertyId]: seeded,
						},
					}));
					return;
				}

				const { loadingPropertyIds } = get();
				if (loadingPropertyIds.includes(propertyId)) return;

				try {
					set((state) => ({
						isPropertyServicesLoading: true,
						loadingPropertyIds: [...state.loadingPropertyIds, propertyId],
						failedPropertyIds: state.failedPropertyIds.filter(
							(id) => id !== propertyId,
						),
					}));

					const res = await fetch(`/api/properties/${propertyId}/services`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch property services");
					}

					const data: PropertyService[] = await res.json();

					const sortByServiceName = (items: PropertyService[]) =>
						items.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

					let resolved: PropertyService[];

					if (data.length > 0) {
						resolved = sortByServiceName(data);
					} else {
						await useServicesStore.getState().fetchServices();
						const globalServices = useServicesStore.getState().services;

						const created = await Promise.all(
							globalServices.map((globalService) =>
								fetch(`/api/properties/${propertyId}/services`, {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										serviceId: globalService.id,
										serviceName: globalService.name,
										unitLabel: globalService.unitLabel,
										pricingType: globalService.pricingType,
										flatAmount: globalService.flatAmount,
										unitPrice: globalService.unitPrice,
									}),
									credentials: "include",
								}).then((response) => {
									if (!response.ok)
										throw new Error("Failed to seed property service");
									return response.json();
								}),
							),
						);

						resolved = sortByServiceName(created);
					}

					set((state) => {
						const newLoadingIds = state.loadingPropertyIds.filter(
							(id) => id !== propertyId,
						);
						return {
							propertyServicesByPropertyId: {
								...state.propertyServicesByPropertyId,
								[propertyId]: resolved,
							},
							isPropertyServicesLoading: newLoadingIds.length > 0,
							loadingPropertyIds: newLoadingIds,
						};
					});
				} catch (error) {
					console.error("Failed to fetch property services:", error);
					set((state) => {
						const newLoadingIds = state.loadingPropertyIds.filter(
							(id) => id !== propertyId,
						);
						return {
							isPropertyServicesLoading: newLoadingIds.length > 0,
							loadingPropertyIds: newLoadingIds,
							failedPropertyIds: [...state.failedPropertyIds, propertyId],
						};
					});
					throw error;
				}
			},

			addPropertyService: async (propertyId, serviceId, data) => {
				const user = useAuthStore.getState().user;
				const { propertyServicesByPropertyId } = get();
				const current = propertyServicesByPropertyId[propertyId] ?? [];

				if (current.some((ps) => ps.serviceId === serviceId)) return;

				if (!user) {
					const newService: PropertyService = {
						id: crypto.randomUUID(),
						propertyId,
						serviceId,
						serviceName: data.serviceName,
						unitLabel: data.unitLabel,
						pricingType: data.pricingType,
						flatAmount: data.flatAmount,
						unitPrice: data.unitPrice,
					};

					set((state) => ({
						propertyServicesByPropertyId: {
							...state.propertyServicesByPropertyId,
							[propertyId]: [
								...(state.propertyServicesByPropertyId[propertyId] ?? []),
								newService,
							].sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
						},
					}));
					return;
				}

				try {
					const res = await fetch(`/api/properties/${propertyId}/services`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ serviceId, ...data }),
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to add property service");
					}

					const responseData: PropertyService = await res.json();

					set((state) => ({
						propertyServicesByPropertyId: {
							...state.propertyServicesByPropertyId,
							[propertyId]: [
								...(state.propertyServicesByPropertyId[propertyId] ?? []),
								responseData,
							].sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
						},
					}));
				} catch (error) {
					console.error("Failed to add property service:", error);
					throw error;
				}
			},

			updatePropertyService: async (propertyId, serviceId, data) => {
				const user = useAuthStore.getState().user;

				if (!user) {
					set((state) => ({
						propertyServicesByPropertyId: {
							...state.propertyServicesByPropertyId,
							[propertyId]: (
								state.propertyServicesByPropertyId[propertyId] ?? []
							).map((ps) =>
								ps.serviceId === serviceId ? { ...ps, ...data } : ps,
							),
						},
					}));
					return;
				}

				try {
					const res = await fetch(
						`/api/properties/${propertyId}/services/${serviceId}`,
						{
							method: "PATCH",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(data),
							credentials: "include",
						},
					);

					if (!res.ok) {
						throw new Error("Failed to update property service");
					}

					const responseData: Partial<PropertyService> = await res.json();

					set((state) => ({
						propertyServicesByPropertyId: {
							...state.propertyServicesByPropertyId,
							[propertyId]: (
								state.propertyServicesByPropertyId[propertyId] ?? []
							).map((ps) =>
								ps.serviceId === serviceId ? { ...ps, ...responseData } : ps,
							),
						},
					}));
				} catch (error) {
					console.error("Failed to update property service:", error);
					throw error;
				}
			},

			deletePropertyService: async (propertyId, serviceId) => {
				const user = useAuthStore.getState().user;

				if (!user) {
					set((state) => ({
						propertyServicesByPropertyId: {
							...state.propertyServicesByPropertyId,
							[propertyId]: (
								state.propertyServicesByPropertyId[propertyId] ?? []
							).filter((ps) => ps.serviceId !== serviceId),
						},
					}));
					return;
				}

				try {
					const res = await fetch(
						`/api/properties/${propertyId}/services/${serviceId}`,
						{
							method: "DELETE",
							credentials: "include",
						},
					);

					if (!res.ok) {
						throw new Error("Failed to remove property service");
					}

					set((state) => ({
						propertyServicesByPropertyId: {
							...state.propertyServicesByPropertyId,
							[propertyId]: (
								state.propertyServicesByPropertyId[propertyId] ?? []
							).filter((ps) => ps.serviceId !== serviceId),
						},
					}));
				} catch (error) {
					console.error("Failed to remove property service:", error);
					throw error;
				}
			},

			clearStore: () =>
				set({
					propertyServicesByPropertyId: {},
					isPropertyServicesLoading: false,
					loadingPropertyIds: [],
					failedPropertyIds: [],
				}),
		}),
		{ name: "property-services" },
	),
);
