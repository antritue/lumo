import type { Property } from "@/components/dashboard/properties/types";
import type { Room } from "@/components/dashboard/rooms/types";
import type { Tenant, TenantTab } from "./types";
import { compareNames, compareNatural, getTenantSearchText } from "./utils";

export interface TenantListItem {
	tenant: Tenant;
	room?: Room;
	propertyName?: string;
}

export interface TenantListSelection {
	items: TenantListItem[];
	counts: Record<TenantTab, number>;
}

export function selectVisibleTenants(
	tenants: Tenant[],
	rooms: Room[],
	properties: Property[],
	tab: TenantTab,
	query: string,
): TenantListSelection {
	const roomById = new Map(rooms.map((room) => [room.id, room]));
	const propertyNameById = new Map(
		properties.map((property) => [property.id, property.name]),
	);
	const normalizedQuery = query.trim().toLowerCase();

	const visible = tenants.filter((tenant) => {
		if (tab === "active" && tenant.roomId === null) return false;
		if (tab === "inactive" && tenant.roomId !== null) return false;
		if (!normalizedQuery) return true;

		const room = tenant.roomId ? roomById.get(tenant.roomId) : undefined;
		const propertyName = room
			? (propertyNameById.get(room.propertyId) ?? null)
			: null;

		return getTenantSearchText(
			tenant,
			room?.name ?? null,
			propertyName,
		).includes(normalizedQuery);
	});

	visible.sort((a, b) => {
		const roomA = a.roomId ? roomById.get(a.roomId) : undefined;
		const roomB = b.roomId ? roomById.get(b.roomId) : undefined;

		if (roomA && roomB) {
			const propertyCompare = compareNatural(
				propertyNameById.get(roomA.propertyId) ?? "",
				propertyNameById.get(roomB.propertyId) ?? "",
			);
			if (propertyCompare !== 0) return propertyCompare;

			const roomCompare = compareNatural(roomA.name, roomB.name);
			if (roomCompare !== 0) return roomCompare;

			return compareNames(a.fullName, b.fullName);
		}

		if (roomA) return -1;
		if (roomB) return 1;

		return compareNames(a.fullName, b.fullName);
	});

	const activeCount = tenants.filter((tenant) => tenant.roomId !== null).length;

	return {
		items: visible.map((tenant) => {
			const room = tenant.roomId ? roomById.get(tenant.roomId) : undefined;

			return {
				tenant,
				room,
				propertyName: room ? propertyNameById.get(room.propertyId) : undefined,
			};
		}),
		counts: {
			active: activeCount,
			inactive: tenants.length - activeCount,
			all: tenants.length,
		},
	};
}
