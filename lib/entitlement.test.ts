import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_ROOM_LIMIT } from "@/lib/constants";
import {
	getRoomLimit,
	getUserEntitlement,
	isPaid,
	type UserEntitlement,
} from "./entitlement";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockFrom = vi.fn();
const mockSupabase = { from: mockFrom } as never;

describe("isPaid", () => {
	it("returns false when there is no entitlement", () => {
		expect(isPaid(null)).toBe(false);
	});

	it("returns true for an active lifetime entitlement", () => {
		expect(isPaid(entitlement({ tier: "lifetime", status: "active" }))).toBe(
			true,
		);
	});

	it("returns false for a revoked lifetime entitlement", () => {
		expect(isPaid(entitlement({ tier: "lifetime", status: "revoked" }))).toBe(
			false,
		);
	});

	it("returns true for an active subscription within its billing period", () => {
		const future = new Date(Date.now() + 86_400_000).toISOString();
		expect(
			isPaid(
				entitlement({
					tier: "monthly",
					status: "active",
					currentPeriodEnd: future,
				}),
			),
		).toBe(true);
	});

	it("returns true for a canceled subscription still within its paid period", () => {
		const future = new Date(Date.now() + 86_400_000).toISOString();
		expect(
			isPaid(
				entitlement({
					tier: "yearly",
					status: "canceled",
					currentPeriodEnd: future,
				}),
			),
		).toBe(true);
	});

	it("returns false for a subscription past its billing period", () => {
		const past = new Date(Date.now() - 86_400_000).toISOString();
		expect(
			isPaid(
				entitlement({
					tier: "monthly",
					status: "active",
					currentPeriodEnd: past,
				}),
			),
		).toBe(false);
	});

	it("returns false for a revoked subscription regardless of period", () => {
		const future = new Date(Date.now() + 86_400_000).toISOString();
		expect(
			isPaid(
				entitlement({
					tier: "monthly",
					status: "revoked",
					currentPeriodEnd: future,
				}),
			),
		).toBe(false);
	});

	it("returns false when a subscription has no period end", () => {
		expect(isPaid(entitlement({ tier: "monthly", status: "active" }))).toBe(
			false,
		);
	});
});

describe("getRoomLimit", () => {
	it("returns null (unlimited) for a paid entitlement", () => {
		expect(
			getRoomLimit(entitlement({ tier: "lifetime", status: "active" })),
		).toBeNull();
	});

	it("returns the free room limit for a free user", () => {
		expect(getRoomLimit(null)).toBe(FREE_ROOM_LIMIT);
	});

	it("returns the free room limit for a lapsed subscription", () => {
		const past = new Date(Date.now() - 86_400_000).toISOString();
		expect(
			getRoomLimit(
				entitlement({
					tier: "monthly",
					status: "active",
					currentPeriodEnd: past,
				}),
			),
		).toBe(FREE_ROOM_LIMIT);
	});
});

describe("getUserEntitlement", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
	});

	it("returns null when there is no entitlement row", async () => {
		mockMaybeSingle.mockResolvedValue({ data: null, error: null });
		const result = await getUserEntitlement("user-1", mockSupabase);
		expect(result).toBeNull();
		expect(mockFrom).toHaveBeenCalledWith("user_entitlements");
		expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
	});

	it("returns null when the query errors", async () => {
		mockMaybeSingle.mockResolvedValue({ data: null, error: new Error("boom") });
		const result = await getUserEntitlement("user-1", mockSupabase);
		expect(result).toBeNull();
	});

	it("maps the row to camelCase", async () => {
		mockMaybeSingle.mockResolvedValue({
			data: {
				id: "ent-1",
				user_id: "user-1",
				polar_customer_id: "cust-1",
				tier: "lifetime",
				status: "active",
				current_period_end: null,
			},
			error: null,
		});
		const result = await getUserEntitlement("user-1", mockSupabase);
		expect(result).toEqual({
			id: "ent-1",
			userId: "user-1",
			polarCustomerId: "cust-1",
			tier: "lifetime",
			status: "active",
			currentPeriodEnd: null,
		});
	});
});

function entitlement(
	overrides: Partial<UserEntitlement> = {},
): UserEntitlement {
	return {
		id: "ent-1",
		userId: "user-1",
		polarCustomerId: null,
		tier: "monthly",
		status: "active",
		currentPeriodEnd: null,
		...overrides,
	};
}
