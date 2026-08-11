import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "./route";

const mockGetUser = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockAdminDeleteUser = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: { getUser: mockGetUser },
		from: mockFrom,
	})),
}));

vi.mock("@/lib/supabase-admin", () => ({
	createSupabaseAdminClient: vi.fn(() => ({
		auth: { admin: { deleteUser: mockAdminDeleteUser } },
	})),
}));

describe("DELETE /api/settings/delete-account", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockReturnValue({ delete: () => ({ eq: mockEq }) });
		mockEq.mockResolvedValue({ error: null });
	});

	it("returns 401 when user is not authenticated", async () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

		const res = await DELETE();

		expect(res.status).toBe(401);
	});

	it("returns 500 when data deletion fails", async () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "test-user-id" } },
			error: null,
		});
		mockEq.mockResolvedValue({ error: new Error("DB error") });

		const res = await DELETE();

		expect(res.status).toBe(500);
	});

	it("returns 204 and deletes auth user on success", async () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "test-user-id" } },
			error: null,
		});
		mockAdminDeleteUser.mockResolvedValue({ error: null });

		const res = await DELETE();

		expect(res.status).toBe(204);
		expect(mockFrom).toHaveBeenCalledTimes(8);
		for (const table of [
			"rent_payment_charges",
			"rent_payments",
			"room_services",
			"property_services",
			"rooms",
			"properties",
			"services",
			"user_entitlements",
		]) {
			expect(mockFrom).toHaveBeenCalledWith(table);
		}
		expect(mockAdminDeleteUser).toHaveBeenCalledWith("test-user-id");
	});
});
