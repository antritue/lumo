import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateRentPayment } from "./route";

const mockGetUser = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockEq2 = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			update: mockUpdate,
		})),
	})),
}));

describe("PATCH /api/rent-payments/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUpdate.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
		mockEq2.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ single: mockSingle });
	});

	const createRequest = (id: string, body: Record<string, unknown>) => {
		return new NextRequest(`http://localhost:3000/api/rent-payments/${id}`, {
			method: "PATCH",
			body: JSON.stringify(body),
		});
	};

	const createParams = (id: string) => ({
		params: Promise.resolve({ id }),
	});

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

	it("should return 200 when authenticated user updates payment period", async () => {
		mockAuthenticatedUser();
		const mockPayment = {
			id: "payment-1",
			room_id: "room-1",
			user_id: "test-user-id",
			period: "2026-04",
			amount: 500,
			status: "pending",
		};
		mockSingle.mockResolvedValue({
			data: mockPayment,
			error: null,
		});

		const req = createRequest("payment-1", { period: "2026-04" });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			id: "payment-1",
			roomId: "room-1",
			userId: "test-user-id",
			period: "2026-04",
			amount: 500,
			status: "pending",
		});
		expect(mockUpdate).toHaveBeenCalledWith({ period: "2026-04" });
		expect(mockEq).toHaveBeenCalledWith("id", "payment-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 200 when authenticated user updates payment amount", async () => {
		mockAuthenticatedUser();
		const mockPayment = {
			id: "payment-1",
			room_id: "room-1",
			user_id: "test-user-id",
			period: "2026-03",
			amount: 750,
			status: "pending",
		};
		mockSingle.mockResolvedValue({
			data: mockPayment,
			error: null,
		});

		const req = createRequest("payment-1", { amount: 750 });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.amount).toBe(750);
		expect(mockUpdate).toHaveBeenCalledWith({ amount: 750 });
	});

	it("should return 200 when authenticated user updates payment status", async () => {
		mockAuthenticatedUser();
		const mockPayment = {
			id: "payment-1",
			room_id: "room-1",
			user_id: "test-user-id",
			period: "2026-03",
			amount: 500,
			status: "paid",
		};
		mockSingle.mockResolvedValue({
			data: mockPayment,
			error: null,
		});

		const req = createRequest("payment-1", { status: "paid" });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.status).toBe("paid");
		expect(mockUpdate).toHaveBeenCalledWith({ status: "paid" });
	});

	it("should return 200 when updating multiple fields", async () => {
		mockAuthenticatedUser();
		const mockPayment = {
			id: "payment-1",
			room_id: "room-1",
			user_id: "test-user-id",
			period: "2026-05",
			amount: 800,
			status: "paid",
		};
		mockSingle.mockResolvedValue({
			data: mockPayment,
			error: null,
		});

		const req = createRequest("payment-1", {
			period: "2026-05",
			amount: 800,
			status: "paid",
		});
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.period).toBe("2026-05");
		expect(data.amount).toBe(800);
		expect(data.status).toBe("paid");
		expect(mockUpdate).toHaveBeenCalledWith({
			period: "2026-05",
			amount: 800,
			status: "paid",
		});
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("payment-1", { amount: 750 });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when period is invalid format", async () => {
		mockAuthenticatedUser();

		const req = createRequest("payment-1", { period: "invalid" });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 400 when amount is not positive", async () => {
		mockAuthenticatedUser();

		const req = createRequest("payment-1", { amount: -100 });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 400 when status is invalid", async () => {
		mockAuthenticatedUser();

		const req = createRequest("payment-1", { status: "invalid" });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 404 when payment record is not found", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows found" },
		});

		const req = createRequest("non-existent-id", { amount: 750 });
		const res = await updateRentPayment(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Payment record not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("payment-1", { amount: 750 });
		const res = await updateRentPayment(req, createParams("payment-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
