import type { Tenant } from "./types";

const nameCollator = new Intl.Collator(undefined, { sensitivity: "base" });
const naturalCollator = new Intl.Collator(undefined, {
	numeric: true,
	sensitivity: "base",
});

export function compareNames(a: string, b: string): number {
	return nameCollator.compare(a, b);
}

export function compareNatural(a: string, b: string): number {
	return naturalCollator.compare(a, b);
}

export function getTenantByRoomId(
	tenants: Tenant[],
	roomId: string | null,
): Tenant | undefined {
	if (!roomId) return undefined;
	return tenants.find((tenant) => tenant.roomId === roomId);
}

export function getTenantSearchText(
	tenant: Tenant,
	roomName: string | null,
	propertyName: string | null,
): string {
	return [
		tenant.fullName,
		tenant.phone ?? "",
		tenant.email ?? "",
		roomName ?? "",
		propertyName ?? "",
	]
		.join(" ")
		.toLowerCase();
}
