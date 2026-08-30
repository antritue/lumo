import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { RoomService } from "./types";

interface RoomServicesState {
	roomServicesByRoomId: Record<string, RoomService[]>;
	isRoomServicesLoading: boolean;
	isRoomServicesFetchFailed: boolean;
	fetchingRoomId: string | null;

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
			fetchingRoomId: null,
			isRoomServicesFetchFailed: false,

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
						serviceId: ps.id,
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

				const { fetchingRoomId, roomServicesByRoomId } = get();
				if (fetchingRoomId === roomId) return;
				if (roomId in roomServicesByRoomId) return;

				try {
					set({
						isRoomServicesLoading: true,
						fetchingRoomId: roomId,
						isRoomServicesFetchFailed: false,
					});

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

					set((state) => ({
						roomServicesByRoomId: {
							...state.roomServicesByRoomId,
							[roomId]: sortByServiceName(data),
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
						body: JSON.stringify([{ serviceId, ...data }]),
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to add room service");
					}

					const [responseData] = (await res.json()) as RoomService[];

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
					fetchingRoomId: null,
					isRoomServicesFetchFailed: false,
				}),
		}),
		{ name: "room-services" },
	),
);
