import { describe, expect, it } from "vitest";
import { compareNatural, getTenantSearchText } from "./utils";

describe("compareNatural", () => {
	it("orders numbered rooms naturally", () => {
		expect(["Room 10", "Room 2", "Room 1"].sort(compareNatural)).toEqual([
			"Room 1",
			"Room 2",
			"Room 10",
		]);
	});
});

describe("getTenantSearchText", () => {
	it("includes name, contact, room, and property", () => {
		const text = getTenantSearchText(
			{
				id: "1",
				userId: "",
				roomId: "room-1",
				fullName: "Anh Nguyen",
				phone: "0901 234 567",
				email: "anh@example.com",
				notes: null,
			},
			"Room 101",
			"Vinhomes Central Park",
		);

		expect(text).toContain("anh nguyen");
		expect(text).toContain("0901 234 567");
		expect(text).toContain("anh@example.com");
		expect(text).toContain("room 101");
		expect(text).toContain("vinhomes central park");
	});
});
