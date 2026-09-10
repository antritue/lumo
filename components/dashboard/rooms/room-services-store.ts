import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { PropertyService } from "@/components/dashboard/properties/types";
import type { EffectiveRoomService } from "./types";

interface RoomServiceOverrideRow {
	service_id: string;
	is_enabled: boolean;
	custom_flat_amount: number | null;
	custom_unit_price: number | null;
}

interface RoomServicesState {
	roomServicesByRoomId: Record<string, EffectiveRoomService[]>;
	roomPropertyMap: Record<string, string>;
	isRoomServicesLoading: boolean;
	isRoomServicesFetchFailed: boolean;
	fetchingRoomId: string | null;

	fetchRoomServices: (roomId: string, propertyId: string) => Promise<void>;
	toggleService: (
		roomId: string,
		propertyServiceId: string,
		enabled: boolean,
	) => Promise<void>;
	setCustomPrice: (
		roomId: string,
		propertyServiceId: string,
		flatAmount: number | null,
		unitPrice: number | null,
	) => Promise<void>;
	resetToDefault: (roomId: string, propertyServiceId: string) => Promise<void>;
	clearStore: () => void;
}

const buildInheritedService = (
	propertyService: PropertyService,
): EffectiveRoomService => ({
	propertyServiceId: propertyService.id,
	serviceName: propertyService.serviceName,
	unitLabel: propertyService.unitLabel,
	pricingType: propertyService.pricingType,
	flatAmount: propertyService.flatAmount,
	unitPrice: propertyService.unitPrice,
	isEnabled: true,
	isOverridden: false,
});

export const useRoomServicesStore = create<RoomServicesState>()(
	devtools(
		(set, get) => {
			const getPropertyService = (
				roomId: string,
				propertyServiceId: string,
			): PropertyService | undefined => {
				const propertyId = get().roomPropertyMap[roomId];
				if (propertyId === undefined) return undefined;
				return (
					usePropertyServicesStore.getState().propertyServicesByPropertyId[
						propertyId
					] ?? []
				).find((ps) => ps.id === propertyServiceId);
			};

			const applyInheritedService = async (
				roomId: string,
				propertyServiceId: string,
			) => {
				const propertyId = get().roomPropertyMap[roomId];
				const propertyService = getPropertyService(roomId, propertyServiceId);

				if (!propertyService) {
					await get().fetchRoomServices(roomId, propertyId ?? "");
					return;
				}

				const inherited = buildInheritedService(propertyService);
				set((state) => ({
					roomServicesByRoomId: {
						...state.roomServicesByRoomId,
						[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map((s) =>
							s.propertyServiceId === propertyServiceId ? inherited : s,
						),
					},
				}));
			};

			return {
				roomServicesByRoomId: {},
				roomPropertyMap: {},
				isRoomServicesLoading: false,
				fetchingRoomId: null,
				isRoomServicesFetchFailed: false,

				fetchRoomServices: async (roomId, propertyId) => {
					const user = useAuthStore.getState().user;

					if (!user) {
						const propertyServices: PropertyService[] =
							usePropertyServicesStore.getState().propertyServicesByPropertyId[
								propertyId
							] ?? [];

						set((state) => ({
							roomServicesByRoomId: {
								...state.roomServicesByRoomId,
								[roomId]: propertyServices
									.map(buildInheritedService)
									.sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
							},
							roomPropertyMap: {
								...state.roomPropertyMap,
								[roomId]: propertyId,
							},
						}));
						return;
					}

					const { fetchingRoomId } = get();
					if (fetchingRoomId === roomId) return;

					try {
						set({
							isRoomServicesLoading: true,
							fetchingRoomId: roomId,
							isRoomServicesFetchFailed: false,
						});

						await usePropertyServicesStore
							.getState()
							.fetchPropertyServices(propertyId);
						const propertyServices: PropertyService[] =
							usePropertyServicesStore.getState().propertyServicesByPropertyId[
								propertyId
							] ?? [];

						const res = await fetch(`/api/rooms/${roomId}/service-overrides`, {
							method: "GET",
							credentials: "include",
						});

						if (!res.ok) {
							throw new Error("Failed to fetch room services");
						}

						const overrides = (await res.json()) as RoomServiceOverrideRow[];

						const overrideMap = new Map(
							overrides.map((o) => [o.service_id, o]),
						);

						const effectiveServices: EffectiveRoomService[] = propertyServices
							.map((ps) => {
								const override = overrideMap.get(ps.id);
								return {
									propertyServiceId: ps.id,
									serviceName: ps.serviceName,
									unitLabel: ps.unitLabel,
									pricingType: ps.pricingType,
									flatAmount: override?.custom_flat_amount ?? ps.flatAmount,
									unitPrice: override?.custom_unit_price ?? ps.unitPrice,
									isEnabled: override?.is_enabled ?? true,
									isOverridden: !!override,
								};
							})
							.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

						set((state) => ({
							roomServicesByRoomId: {
								...state.roomServicesByRoomId,
								[roomId]: effectiveServices,
							},
							roomPropertyMap: {
								...state.roomPropertyMap,
								[roomId]: propertyId,
							},
							isRoomServicesLoading: false,
							fetchingRoomId: null,
						}));
					} catch (error) {
						console.error("Failed to fetch room services:", error);
						set({
							isRoomServicesLoading: false,
							fetchingRoomId: null,
							isRoomServicesFetchFailed: true,
						});
					}
				},

				toggleService: async (roomId, propertyServiceId, enabled) => {
					const user = useAuthStore.getState().user;

					if (!user) {
						const propertyService = getPropertyService(
							roomId,
							propertyServiceId,
						);
						set((state) => ({
							roomServicesByRoomId: {
								...state.roomServicesByRoomId,
								[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map(
									(s) => {
										if (s.propertyServiceId !== propertyServiceId) return s;
										if (!enabled)
											return { ...s, isEnabled: false, isOverridden: true };
										const matchesDefaults =
											propertyService !== undefined &&
											s.flatAmount === propertyService.flatAmount &&
											s.unitPrice === propertyService.unitPrice;
										return matchesDefaults && propertyService !== undefined
											? buildInheritedService(propertyService)
											: { ...s, isEnabled: true, isOverridden: true };
									},
								),
							},
						}));
						return;
					}

					try {
						const res = await fetch(`/api/rooms/${roomId}/service-overrides`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								serviceId: propertyServiceId,
								isEnabled: enabled,
							}),
							credentials: "include",
						});

						if (!res.ok) {
							throw new Error("Failed to toggle service");
						}

						const data = (await res.json()) as Record<string, unknown> | null;

						if (!data) {
							applyInheritedService(roomId, propertyServiceId);
							return;
						}

						set((state) => ({
							roomServicesByRoomId: {
								...state.roomServicesByRoomId,
								[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map((s) =>
									s.propertyServiceId === propertyServiceId
										? { ...s, isEnabled: enabled, isOverridden: true }
										: s,
								),
							},
						}));
					} catch (error) {
						console.error("Failed to toggle service:", error);
						throw error;
					}
				},

				setCustomPrice: async (
					roomId,
					propertyServiceId,
					flatAmount,
					unitPrice,
				) => {
					const user = useAuthStore.getState().user;

					if (!user) {
						const propertyService = getPropertyService(
							roomId,
							propertyServiceId,
						);
						set((state) => ({
							roomServicesByRoomId: {
								...state.roomServicesByRoomId,
								[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map(
									(s) => {
										if (s.propertyServiceId !== propertyServiceId) return s;
										const matchesDefaults =
											propertyService !== undefined &&
											flatAmount === propertyService.flatAmount &&
											unitPrice === propertyService.unitPrice &&
											s.isEnabled;
										return matchesDefaults && propertyService !== undefined
											? buildInheritedService(propertyService)
											: { ...s, flatAmount, unitPrice, isOverridden: true };
									},
								),
							},
						}));
						return;
					}

					try {
						const res = await fetch(`/api/rooms/${roomId}/service-overrides`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								serviceId: propertyServiceId,
								customFlatAmount: flatAmount,
								customUnitPrice: unitPrice,
							}),
							credentials: "include",
						});

						if (!res.ok) {
							throw new Error("Failed to set custom price");
						}

						const data = (await res.json()) as Record<string, unknown> | null;

						if (!data) {
							applyInheritedService(roomId, propertyServiceId);
							return;
						}

						set((state) => ({
							roomServicesByRoomId: {
								...state.roomServicesByRoomId,
								[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map((s) =>
									s.propertyServiceId === propertyServiceId
										? {
												...s,
												flatAmount,
												unitPrice,
												isOverridden: true,
											}
										: s,
								),
							},
						}));
					} catch (error) {
						console.error("Failed to set custom price:", error);
						throw error;
					}
				},

				resetToDefault: async (roomId, propertyServiceId) => {
					const user = useAuthStore.getState().user;

					if (!user) {
						const services = get().roomServicesByRoomId[roomId] ?? [];
						const service = services.find(
							(s) => s.propertyServiceId === propertyServiceId,
						);
						if (!service?.isOverridden) return;
						await applyInheritedService(roomId, propertyServiceId);
						return;
					}

					try {
						const services = get().roomServicesByRoomId[roomId] ?? [];
						const service = services.find(
							(s) => s.propertyServiceId === propertyServiceId,
						);
						if (!service?.isOverridden) return;

						const res = await fetch(
							`/api/rooms/${roomId}/service-overrides/${service.propertyServiceId}`,
							{
								method: "DELETE",
								credentials: "include",
							},
						);

						if (!res.ok) {
							throw new Error("Failed to reset service");
						}

						applyInheritedService(roomId, propertyServiceId);
					} catch (error) {
						console.error("Failed to reset service:", error);
						throw error;
					}
				},

				clearStore: () =>
					set({
						roomServicesByRoomId: {},
						roomPropertyMap: {},
						isRoomServicesLoading: false,
						fetchingRoomId: null,
						isRoomServicesFetchFailed: false,
					}),
			};
		},
		{ name: "room-services" },
	),
);
