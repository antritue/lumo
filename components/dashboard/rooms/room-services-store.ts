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

export const useRoomServicesStore = create<RoomServicesState>()(
	devtools(
		(set, get) => ({
			roomServicesByRoomId: {},
			isRoomServicesLoading: false,
			fetchingRoomId: null,
			isRoomServicesFetchFailed: false,

			fetchRoomServices: async (roomId, propertyId) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

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

					const overrideMap = new Map(overrides.map((o) => [o.service_id, o]));

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
				if (!user) return;

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
				if (!user) return;

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
				if (!user) return;

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

					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map((s) =>
								s.propertyServiceId === propertyServiceId
									? {
											...s,
											isOverridden: false,
											isEnabled: true,
										}
									: s,
							),
						},
					}));
				} catch (error) {
					console.error("Failed to reset service:", error);
					throw error;
				}
			},

			clearStore: () =>
				set({
					roomServicesByRoomId: {},
					isRoomServicesLoading: false,
					fetchingRoomId: null,
					isRoomServicesFetchFailed: false,
				}),
		}),
		{ name: "room-services" },
	),
);
