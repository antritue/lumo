import { describe, expect, it } from "vitest";
import type { Property } from "@/components/dashboard/properties/types";
import type { Room } from "@/components/dashboard/rooms/types";
import { selectVisibleTenants } from "./select-visible-tenants";
import type { Tenant } from "./types";

const properties: Property[] = [
	{ id: "property-1", userId: "", name: "Vinhomes Central Park" },
	{ id: "property-2", userId: "", name: "Masteri Thao Dien" },
];

const rooms: Room[] = [
	{
		id: "room-2",
		propertyId: "property-1",
		name: "Room 2",
		monthlyRent: null,
		notes: null,
	},
	{
		id: "room-10",
		propertyId: "property-2",
		name: "Room 10",
		monthlyRent: null,
		notes: null,
	},
];

const tenants: Tenant[] = [
	{
		id: "tenant-1",
		userId: "",
		roomId: "room-2",
		fullName: "Anh Nguyen",
		phone: "0901 234 567",
		email: "anh@example.com",
		notes: null,
	},
	{
		id: "tenant-2",
		userId: "",
		roomId: "room-10",
		fullName: "Binh Le",
		phone: "0912 345 678",
		email: null,
		notes: null,
	},
	{
		id: "tenant-3",
		userId: "",
		roomId: null,
		fullName: "Minh Ngo",
		phone: null,
		email: "minh@example.com",
		notes: null,
	},
];

const names = (
	result: ReturnType<typeof selectVisibleTenants>,
): (string | undefined)[] => result.items.map(({ tenant }) => tenant.fullName);

describe("selectVisibleTenants", () => {
	it("resolves room and property names and returns counts", () => {
		const result = selectVisibleTenants(tenants, rooms, properties, "all", "");

		expect(result.counts).toEqual({ active: 2, inactive: 1, all: 3 });
		expect(names(result)).toEqual(["Binh Le", "Anh Nguyen", "Minh Ngo"]);
		expect(result.items[0]).toMatchObject({
			room: { name: "Room 10" },
			propertyName: "Masteri Thao Dien",
		});
		expect(result.items[2].room).toBeUndefined();
	});

	it("filters by tab", () => {
		expect(
			names(selectVisibleTenants(tenants, rooms, properties, "active", "")),
		).toEqual(["Binh Le", "Anh Nguyen"]);
		expect(
			names(selectVisibleTenants(tenants, rooms, properties, "inactive", "")),
		).toEqual(["Minh Ngo"]);
	});

	it("searches name, room, and property", () => {
		expect(
			names(selectVisibleTenants(tenants, rooms, properties, "all", "anh")),
		).toEqual(["Anh Nguyen"]);
		expect(
			names(selectVisibleTenants(tenants, rooms, properties, "all", "room 10")),
		).toEqual(["Binh Le"]);
		expect(
			names(selectVisibleTenants(tenants, rooms, properties, "all", "masteri")),
		).toEqual(["Binh Le"]);
	});
});
