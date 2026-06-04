import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RentPaymentInput } from "@/lib/validations/rent-payment";
import { createRentPayment } from "./route";

const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockRoomSelect = vi.fn();
const mockRoomEq = vi.fn();
const mockRoomEq2 = vi.fn();
const mockRoomSingle = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn((table: string) => {
			if (table === "rooms") {
				return { select: mockRoomSelect };
			}
			return { insert: mockInsert };
		}),
	})),
}));

describe("POST /api/rent-payments", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockInsert.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ single: mockSingle });
		mockRoomSelect.mockReturnValue({ eq: mockRoomEq });
		mockRoomEq.mockReturnValue({ eq: mockRoomEq2 });
		mockRoomEq2.mockReturnValue({ single: mockRoomSingle });
	});

	const createRequest = (
		body: Partial<RentPaymentInput> | Record<string, unknown>,
	) => {
		return new NextRequest("http://localhost:3000/api/rent-payments", {
			method: "POST",
			body: JSON.stringify(body),
		});
	};

	const mockAuthenticatedUser = () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "test-user-id" } },
		});
	};

	const mockUnauthenticated = () => {
		mockGetUser.mockResolvedValue({
			data: { user: null },
		});
	};

	const mockRoomExists = (exists: boolean) => {
		mockRoomSingle.mockResolvedValue({
			data: exists ? { id: "room-1" } : null,
			error: exists ? null : { code: "PGRST116" },
		});
	};

	it("should return 201 when creating a payment for an authenticated user", async () => {
		mockAuthenticatedUser();
		mockRoomExists(true);
		mockSingle.mockResolvedValue({
			data: {
				id: "payment-1",
				room_id: "room-1",
				user_id: "test-user-id",
				period: "2026-03",
				amount: 500,
				status: "pending",
			},
			error: null,
		});

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.period).toBe("2026-03");
		expect(data.amount).toBe(500);
		expect(data.status).toBe("pending");
	});

	it("should return 201 with paid status when provided", async () => {
		mockAuthenticatedUser();
		mockRoomExists(true);
		mockSingle.mockResolvedValue({
			data: {
				id: "payment-1",
				room_id: "room-1",
				user_id: "test-user-id",
				period: "2026-03",
				amount: 500,
				status: "paid",
			},
			error: null,
		});

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: 500,
			status: "paid",
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.status).toBe("paid");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
		expect(data.code).toBe("UNAUTHORIZED");
	});

	it("should return 400 when roomId is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			period: "2026-03",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 when period is invalid format", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "invalid",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 400 when amount is not positive", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: -100,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.code).toBe("VALIDATION_ERROR");
	});

	it("should return 404 when room does not exist", async () => {
		mockAuthenticatedUser();
		mockRoomExists(false);

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room not found");
		expect(data.code).toBe("ROOM_NOT_FOUND");
	});

	it("should return 409 when duplicate period for same room", async () => {
		mockAuthenticatedUser();
		mockRoomExists(true);
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "23505", message: "duplicate key value" },
		});

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(409);
		expect(data.code).toBe("DUPLICATE_PERIOD");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockRoomExists(true);
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
		expect(data.code).toBe("INTERNAL_ERROR");
	});
});
