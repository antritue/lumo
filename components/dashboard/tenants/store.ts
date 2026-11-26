import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Tenant, TenantInput } from "./types";

export class RoomOccupiedError extends Error {
	constructor() {
		super("Room already has an active tenant");
		this.name = "RoomOccupiedError";
	}
}

interface TenantsState {
	tenants: Tenant[];

	isTenantsLoading: boolean;
	hasTenantsFetched: boolean;
	isTenantsFetchFailed: boolean;
	fetchingTenantRoomId: string | null;
	failedTenantRoomId: string | null;

	// Actions
	fetchTenants: () => Promise<void>;
	fetchTenantByRoomId: (roomId: string) => Promise<void>;
	createTenant: (input: TenantInput) => Promise<void>;
	updateTenant: (id: string, input: TenantInput) => Promise<void>;
	deactivateTenant: (id: string) => Promise<void>;
	deleteTenant: (id: string) => Promise<void>;
	unassignByRoomId: (roomId: string) => void;
	clearStore: () => void;
}

function findOccupant(
	tenants: Tenant[],
	roomId: string | null,
	ignoreTenantId?: string,
): Tenant | undefined {
	if (!roomId) return undefined;
	return tenants.find(
		(tenant) => tenant.roomId === roomId && tenant.id !== ignoreTenantId,
	);
}

export const useTenantsStore = create<TenantsState>()(
	devtools(
		(set, get) => ({
			tenants: [],
			isTenantsLoading: false,
			hasTenantsFetched: false,
			isTenantsFetchFailed: false,
			fetchingTenantRoomId: null,
			failedTenantRoomId: null,

			fetchTenants: async () => {
				const { hasTenantsFetched, isTenantsLoading } = get();
				const user = useAuthStore.getState().user;

				if (!user || hasTenantsFetched || isTenantsLoading) {
					return;
				}

				try {
					set({ isTenantsLoading: true });
					const res = await fetch("/api/tenants", {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch tenants");
					}

					const data = await res.json();
					set({
						tenants: data,
						isTenantsLoading: false,
						hasTenantsFetched: true,
						isTenantsFetchFailed: false,
					});
				} catch (error) {
					console.error("Failed to fetch tenants:", error);
					set({
						isTenantsLoading: false,
						hasTenantsFetched: false,
						isTenantsFetchFailed: true,
					});
					throw error;
				}
			},

			fetchTenantByRoomId: async (roomId) => {
				const { hasTenantsFetched, fetchingTenantRoomId } = get();
				const user = useAuthStore.getState().user;

				if (!user || hasTenantsFetched || fetchingTenantRoomId === roomId) {
					return;
				}

				try {
					set({ fetchingTenantRoomId: roomId });
					const res = await fetch(`/api/rooms/${roomId}/tenant`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch room tenant");
					}

					const data: Tenant | null = await res.json();

					set((state) => ({
						tenants: [
							...state.tenants.filter(
								(tenant) => tenant.roomId !== roomId && tenant.id !== data?.id,
							),
							...(data ? [data] : []),
						],
						fetchingTenantRoomId:
							state.fetchingTenantRoomId === roomId
								? null
								: state.fetchingTenantRoomId,
						failedTenantRoomId:
							state.failedTenantRoomId === roomId
								? null
								: state.failedTenantRoomId,
					}));
				} catch (error) {
					console.error("Failed to fetch room tenant:", error);
					set((state) => ({
						fetchingTenantRoomId:
							state.fetchingTenantRoomId === roomId
								? null
								: state.fetchingTenantRoomId,
						failedTenantRoomId: roomId,
					}));
					throw error;
				}
			},

			createTenant: async (input) => {
				const user = useAuthStore.getState().user;

				if (findOccupant(get().tenants, input.roomId)) {
					throw new RoomOccupiedError();
				}

				if (user) {
					const res = await fetch("/api/tenants", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(input),
						credentials: "include",
					});

					if (res.status === 409) {
						throw new RoomOccupiedError();
					}

					if (!res.ok) {
						const error = new Error("Failed to create tenant");
						console.error("Failed to create tenant:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						tenants: [...state.tenants, data],
					}));
				} else {
					set((state) => ({
						tenants: [
							...state.tenants,
							{
								id: crypto.randomUUID(),
								userId: "",
								...input,
							},
						],
					}));
				}
			},

			updateTenant: async (id, input) => {
				const user = useAuthStore.getState().user;

				if (findOccupant(get().tenants, input.roomId, id)) {
					throw new RoomOccupiedError();
				}

				if (user) {
					const res = await fetch(`/api/tenants/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(input),
						credentials: "include",
					});

					if (res.status === 409) {
						throw new RoomOccupiedError();
					}

					if (!res.ok) {
						const error = new Error("Failed to update tenant");
						console.error("Failed to update tenant:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						tenants: state.tenants.map((tenant) =>
							tenant.id === id ? data : tenant,
						),
					}));
				} else {
					set((state) => ({
						tenants: state.tenants.map((tenant) =>
							tenant.id === id ? { ...tenant, ...input } : tenant,
						),
					}));
				}
			},

			deactivateTenant: async (id) => {
				const tenant = get().tenants.find((item) => item.id === id);
				if (!tenant) return;

				await get().updateTenant(id, {
					fullName: tenant.fullName,
					roomId: null,
					phone: tenant.phone,
					email: tenant.email,
					notes: tenant.notes,
				});
			},

			deleteTenant: async (id) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/tenants/${id}`, {
						method: "DELETE",
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to delete tenant");
						console.error("Failed to delete tenant:", error);
						throw error;
					}
				}

				set((state) => ({
					tenants: state.tenants.filter((tenant) => tenant.id !== id),
				}));
			},

			unassignByRoomId: (roomId) =>
				set((state) => ({
					tenants: state.tenants.map((tenant) =>
						tenant.roomId === roomId ? { ...tenant, roomId: null } : tenant,
					),
				})),

			clearStore: () =>
				set({
					tenants: [],
					isTenantsLoading: false,
					hasTenantsFetched: false,
					isTenantsFetchFailed: false,
					fetchingTenantRoomId: null,
					failedTenantRoomId: null,
				}),
		}),
		{ name: "tenants" },
	),
);
