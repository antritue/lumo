import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RentPaymentInput } from "@/lib/validations/rent-payment";
import { createRentPayment, listRentPayments } from "./route";

const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockRoomSelect = vi.fn();
const mockRoomEq = vi.fn();
const mockRoomEq2 = vi.fn();
const mockRoomSingle = vi.fn();
const mockPaymentSelect = vi.fn();
const mockPaymentEq = vi.fn();
const mockPaymentOrder = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: mockFrom,
	})),
}));

describe("POST /api/rent-payments", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockImplementation((table: string) => {
			if (table === "rooms") {
				return { select: mockRoomSelect };
			}
			return { insert: mockInsert };
		});
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
	});

	it("should return 400 when roomId is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			period: "2026-03",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const _data = await res.json();

		expect(res.status).toBe(400);
	});

	it("should return 400 when period is invalid format", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "invalid",
			amount: 500,
		});
		const res = await createRentPayment(req);
		const _data = await res.json();

		expect(res.status).toBe(400);
	});

	it("should return 400 when amount is not positive", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			period: "2026-03",
			amount: -100,
		});
		const res = await createRentPayment(req);
		const _data = await res.json();

		expect(res.status).toBe(400);
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
		expect(data.error).toBe("A payment record already exists for this period");
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
	});
});

describe("GET /api/rent-payments", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockImplementation((table: string) => {
			if (table === "rooms") {
				return { select: mockRoomSelect };
			}
			if (table === "rent_payments") {
				return { select: mockPaymentSelect };
			}
			return {};
		});
		mockRoomSelect.mockReturnValue({ eq: mockRoomEq });
		mockRoomEq.mockReturnValue({ eq: mockRoomEq2 });
		mockRoomEq2.mockReturnValue({ single: mockRoomSingle });
		mockPaymentSelect.mockReturnValue({ eq: mockPaymentEq });
		mockPaymentEq.mockReturnValue({ order: mockPaymentOrder });
	});

	const createRequest = (roomId?: string) => {
		const url = roomId
			? `http://localhost:3000/api/rent-payments?room_id=${roomId}`
			: "http://localhost:3000/api/rent-payments";
		return new NextRequest(url, { method: "GET" });
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

	it("should return 200 with list of payments for authenticated user", async () => {
		mockAuthenticatedUser();
		mockRoomExists(true);
		const mockPayments = [
			{
				id: "payment-2",
				room_id: "room-1",
				user_id: "test-user-id",
				period: "2026-04",
				amount: 600,
				status: "paid",
			},
			{
				id: "payment-1",
				room_id: "room-1",
				user_id: "test-user-id",
				period: "2026-03",
				amount: 500,
				status: "pending",
			},
		];
		mockPaymentOrder.mockResolvedValue({
			data: mockPayments,
			error: null,
		});

		const req = createRequest("room-1");
		const res = await listRentPayments(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual(mockPayments);
		expect(mockPaymentSelect).toHaveBeenCalledWith("*");
		expect(mockPaymentEq).toHaveBeenCalledWith("room_id", "room-1");
		expect(mockPaymentOrder).toHaveBeenCalledWith("period", {
			ascending: false,
		});
	});

	it("should return 200 with empty array when no payments exist", async () => {
		mockAuthenticatedUser();
		mockRoomExists(true);
		mockPaymentOrder.mockResolvedValue({
			data: [],
			error: null,
		});

		const req = createRequest("room-1");
		const res = await listRentPayments(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("room-1");
		const res = await listRentPayments(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when room_id is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest();
		const res = await listRentPayments(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBe("room_id is required");
	});

	it("should return 404 when room does not exist", async () => {
		mockAuthenticatedUser();
		mockRoomExists(false);

		const req = createRequest("room-1");
		const res = await listRentPayments(req);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockRoomExists(true);
		mockPaymentOrder.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("room-1");
		const res = await listRentPayments(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
