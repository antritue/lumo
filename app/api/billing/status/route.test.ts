import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBillingStatus } from "./route";

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();

const mockGetUserEntitlement = vi.fn();
const mockIsPaid = vi.fn();
const mockGetRoomLimit = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: mockFrom,
	})),
}));

vi.mock("@/lib/entitlement", () => ({
	getUserEntitlement: (...args: unknown[]) => mockGetUserEntitlement(...args),
	isPaid: (...args: unknown[]) => mockIsPaid(...args),
	getRoomLimit: (...args: unknown[]) => mockGetRoomLimit(...args),
}));

describe("GET /api/billing/status", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ eq: mockEq });
		mockEq.mockResolvedValue({ count: 0, error: null });
	});

	const mockAuthenticatedUser = () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "test-user-id" } },
			error: null,
		});
	};

	const mockUnauthenticated = () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
	};

	it("returns 200 with free tier status for an authenticated free user", async () => {
		mockAuthenticatedUser();
		mockGetUserEntitlement.mockResolvedValue(null);
		mockIsPaid.mockReturnValue(false);
		mockGetRoomLimit.mockReturnValue(5);

		const res = await getBillingStatus();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			tier: null,
			isPaid: false,
			roomLimit: 5,
			roomCount: 0,
		});
	});

	it("returns 200 with paid tier status for an authenticated paid user", async () => {
		mockAuthenticatedUser();
		mockGetUserEntitlement.mockResolvedValue({
			id: "ent-1",
			tier: "lifetime",
			status: "active",
		});
		mockIsPaid.mockReturnValue(true);
		mockGetRoomLimit.mockReturnValue(null);

		mockEq.mockResolvedValue({ count: 4, error: null });

		const res = await getBillingStatus();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			tier: "lifetime",
			isPaid: true,
			roomLimit: null,
			roomCount: 4,
		});
	});

	it("returns 401 when the user is not authenticated", async () => {
		mockUnauthenticated();

		const res = await getBillingStatus();
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("returns 500 when the room count query fails", async () => {
		mockAuthenticatedUser();
		mockGetUserEntitlement.mockResolvedValue(null);
		mockEq.mockResolvedValue({ count: null, error: { message: "boom" } });

		const res = await getBillingStatus();
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
