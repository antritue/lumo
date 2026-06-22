import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { RoomService } from "./types";

interface RoomServicesState {
	roomServicesByRoomId: Record<string, RoomService[]>;
	isRoomServicesLoading: boolean;
	loadingRoomIds: string[];
	failedRoomIds: string[];

	fetchRoomServices: (roomId: string, propertyId: string) => Promise<void>;
	addRoomService: (
		roomId: string,
		serviceId: string,
		data: {
			serviceName: string;
			unitLabel: string | null;
			pricingType: "flat" | "variable";
			flatAmount: number | null;
			unitPrice: number | null;
		},
	) => Promise<void>;
	updateRoomService: (
		roomId: string,
		serviceId: string,
		data: {
			serviceName?: string;
			unitLabel?: string | null;
			pricingType?: "flat" | "variable";
			flatAmount?: number | null;
			unitPrice?: number | null;
		},
	) => Promise<void>;
	deleteRoomService: (roomId: string, serviceId: string) => Promise<void>;
	clearStore: () => void;
}

export const useRoomServicesStore = create<RoomServicesState>()(
	devtools(
		(set, get) => ({
			roomServicesByRoomId: {},
			isRoomServicesLoading: false,
			loadingRoomIds: [],
			failedRoomIds: [],

			fetchRoomServices: async (roomId, propertyId) => {
				const user = useAuthStore.getState().user;

				if (!user) {
					const { roomServicesByRoomId } = get();
					if (roomServicesByRoomId[roomId]) return;

					const propertyServices =
						usePropertyServicesStore.getState().propertyServicesByPropertyId[
							propertyId
						] ?? [];

					const seeded: RoomService[] = propertyServices.map((ps) => ({
						id: crypto.randomUUID(),
						roomId,
						serviceId: ps.serviceId,
						serviceName: ps.serviceName,
						unitLabel: ps.unitLabel,
						pricingType: ps.pricingType,
						flatAmount: ps.flatAmount,
						unitPrice: ps.unitPrice,
					}));

					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: seeded,
						},
					}));
					return;
				}

				const { loadingRoomIds } = get();
				if (loadingRoomIds.includes(roomId)) return;

				try {
					set((state) => ({
						isRoomServicesLoading: true,
						loadingRoomIds: [...state.loadingRoomIds, roomId],
						failedRoomIds: state.failedRoomIds.filter((id) => id !== roomId),
					}));

					const res = await fetch(`/api/rooms/${roomId}/services`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch room services");
					}

					const data: RoomService[] = await res.json();

					const sortByServiceName = (items: RoomService[]) =>
						items.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

					let resolved: RoomService[];

					if (data.length > 0) {
						resolved = sortByServiceName(data);
					} else {
						const propertyServices =
							usePropertyServicesStore.getState().propertyServicesByPropertyId[
								propertyId
							] ?? [];

						const created = await Promise.all(
							propertyServices.map((ps) =>
								fetch(`/api/rooms/${roomId}/services`, {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										serviceId: ps.serviceId,
										serviceName: ps.serviceName,
										unitLabel: ps.unitLabel,
										pricingType: ps.pricingType,
										flatAmount: ps.flatAmount,
										unitPrice: ps.unitPrice,
									}),
									credentials: "include",
								}).then((response) => {
									if (!response.ok)
										throw new Error("Failed to seed room service");
									return response.json();
								}),
							),
						);

						resolved = sortByServiceName(created);
					}

					set((state) => {
						const newLoadingIds = state.loadingRoomIds.filter(
							(id) => id !== roomId,
						);
						return {
							roomServicesByRoomId: {
								...state.roomServicesByRoomId,
								[roomId]: resolved,
							},
							isRoomServicesLoading: newLoadingIds.length > 0,
							loadingRoomIds: newLoadingIds,
						};
					});
				} catch (error) {
					console.error("Failed to fetch room services:", error);
					set((state) => {
						const newLoadingIds = state.loadingRoomIds.filter(
							(id) => id !== roomId,
						);
						return {
							isRoomServicesLoading: newLoadingIds.length > 0,
							loadingRoomIds: newLoadingIds,
							failedRoomIds: [...state.failedRoomIds, roomId],
						};
					});
				}
			},

			addRoomService: async (roomId, serviceId, data) => {
				const user = useAuthStore.getState().user;
				const { roomServicesByRoomId } = get();
				const current = roomServicesByRoomId[roomId] ?? [];

				if (current.some((rs) => rs.serviceId === serviceId)) return;

				if (!user) {
					const newService: RoomService = {
						id: crypto.randomUUID(),
						roomId,
						serviceId,
						serviceName: data.serviceName,
						unitLabel: data.unitLabel,
						pricingType: data.pricingType,
						flatAmount: data.flatAmount,
						unitPrice: data.unitPrice,
					};

					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: [
								...(state.roomServicesByRoomId[roomId] ?? []),
								newService,
							].sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
						},
					}));
					return;
				}

				try {
					const res = await fetch(`/api/rooms/${roomId}/services`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ serviceId, ...data }),
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to add room service");
					}

					const responseData: RoomService = await res.json();

					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: [
								...(state.roomServicesByRoomId[roomId] ?? []),
								responseData,
							].sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
						},
					}));
				} catch (error) {
					console.error("Failed to add room service:", error);
					throw error;
				}
			},

			updateRoomService: async (roomId, serviceId, data) => {
				const user = useAuthStore.getState().user;

				if (!user) {
					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map((rs) =>
								rs.serviceId === serviceId ? { ...rs, ...data } : rs,
							),
						},
					}));
					return;
				}

				try {
					const res = await fetch(
						`/api/rooms/${roomId}/services/${serviceId}`,
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
						throw new Error("Failed to update room service");
					}

					const responseData: Partial<RoomService> = await res.json();

					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: (state.roomServicesByRoomId[roomId] ?? []).map((rs) =>
								rs.serviceId === serviceId ? { ...rs, ...responseData } : rs,
							),
						},
					}));
				} catch (error) {
					console.error("Failed to update room service:", error);
					throw error;
				}
			},

			deleteRoomService: async (roomId, serviceId) => {
				const user = useAuthStore.getState().user;

				if (!user) {
					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: (state.roomServicesByRoomId[roomId] ?? []).filter(
								(rs) => rs.serviceId !== serviceId,
							),
						},
					}));
					return;
				}

				try {
					const res = await fetch(
						`/api/rooms/${roomId}/services/${serviceId}`,
						{
							method: "DELETE",
							credentials: "include",
						},
					);

					if (!res.ok) {
						throw new Error("Failed to remove room service");
					}

					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: (state.roomServicesByRoomId[roomId] ?? []).filter(
								(rs) => rs.serviceId !== serviceId,
							),
						},
					}));
				} catch (error) {
					console.error("Failed to remove room service:", error);
					throw error;
				}
			},

			clearStore: () =>
				set({
					roomServicesByRoomId: {},
					isRoomServicesLoading: false,
					loadingRoomIds: [],
					failedRoomIds: [],
				}),
		}),
		{ name: "room-services" },
	),
);
