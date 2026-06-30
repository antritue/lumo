import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listRoomRentPaymentCharges } from "./route";

const ROOM_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_ID = "bbbbbbbb-bbbb-4bbb-9bbb-bbbbbbbbbbbb";
const PAYMENT_1_ID = "cccccccc-cccc-4ccc-accc-cccccccccccc";
const PAYMENT_2_ID = "dddddddd-dddd-4ddd-bddd-dddddddddddd";

const mockGetUser = vi.fn();
const mockPaymentsSelect = vi.fn();
const mockPaymentsEq = vi.fn();
const mockPaymentsEq2 = vi.fn();
const mockChargesSelect = vi.fn();
const mockChargesIn = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: { getUser: mockGetUser },
		from: mockFrom,
	})),
}));

describe("GET /api/rooms/:id/rent-payment-charges", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockImplementation((table: string) => {
			if (table === "rent_payments") {
				return { select: mockPaymentsSelect };
			}
			return { select: mockChargesSelect };
		});
		mockPaymentsSelect.mockReturnValue({ eq: mockPaymentsEq });
		mockPaymentsEq.mockReturnValue({ eq: mockPaymentsEq2 });
		mockChargesSelect.mockReturnValue({ in: mockChargesIn });
	});

	const createParams = (id: string) => ({
		params: Promise.resolve({ id }),
	});

	const mockAuthenticatedUser = () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: USER_ID } },
		});
	};

	const mockUnauthenticated = () => {
		mockGetUser.mockResolvedValue({
			data: { user: null },
		});
	};

	it("should return 200 with charges grouped by payment for authenticated user", async () => {
		mockAuthenticatedUser();
		mockPaymentsEq2.mockResolvedValue({
			data: [{ id: PAYMENT_1_ID }, { id: PAYMENT_2_ID }],
			error: null,
		});
		const mockRows = [
			{
				id: "charge-1",
				rent_payment_id: PAYMENT_1_ID,
				user_id: USER_ID,
				service_id: "electricity",
				service_name: "Electricity",
				pricing_type: "variable",
				unit_label: "kWh",
				unit_price: 0.12,
				flat_amount: null,
				usage: 100,
				total: 12,
			},
			{
				id: "charge-2",
				rent_payment_id: PAYMENT_1_ID,
				user_id: USER_ID,
				service_id: "wifi",
				service_name: "WiFi",
				pricing_type: "flat",
				unit_label: null,
				unit_price: null,
				flat_amount: 25,
				usage: null,
				total: 25,
			},
			{
				id: "charge-3",
				rent_payment_id: PAYMENT_2_ID,
				user_id: USER_ID,
				service_id: "water",
				service_name: "Water",
				pricing_type: "flat",
				unit_label: null,
				unit_price: null,
				flat_amount: 30,
				usage: null,
				total: 30,
			},
		];
		mockChargesIn.mockResolvedValue({ data: mockRows, error: null });

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/rent-payment-charges`,
		);
		const res = await listRoomRentPaymentCharges(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			[PAYMENT_1_ID]: [
				{
					id: "charge-1",
					rentPaymentId: PAYMENT_1_ID,
					userId: USER_ID,
					serviceId: "electricity",
					serviceName: "Electricity",
					pricingType: "variable",
					unitLabel: "kWh",
					unitPrice: 0.12,
					flatAmount: null,
					usage: 100,
					total: 12,
				},
				{
					id: "charge-2",
					rentPaymentId: PAYMENT_1_ID,
					userId: USER_ID,
					serviceId: "wifi",
					serviceName: "WiFi",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 25,
					usage: null,
					total: 25,
				},
			],
			[PAYMENT_2_ID]: [
				{
					id: "charge-3",
					rentPaymentId: PAYMENT_2_ID,
					userId: USER_ID,
					serviceId: "water",
					serviceName: "Water",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 30,
					usage: null,
					total: 30,
				},
			],
		});
		expect(mockPaymentsSelect).toHaveBeenCalledWith("id");
		expect(mockPaymentsEq).toHaveBeenCalledWith("room_id", ROOM_ID);
		expect(mockPaymentsEq2).toHaveBeenCalledWith("user_id", USER_ID);
		expect(mockChargesSelect).toHaveBeenCalledWith("*, rent_payment_id");
		expect(mockChargesIn).toHaveBeenCalledWith("rent_payment_id", [
			PAYMENT_1_ID,
			PAYMENT_2_ID,
		]);
	});

	it("should return 200 with empty object when room has no payments", async () => {
		mockAuthenticatedUser();
		mockPaymentsEq2.mockResolvedValue({
			data: [],
			error: null,
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/rent-payment-charges`,
		);
		const res = await listRoomRentPaymentCharges(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({});
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/rent-payment-charges`,
		);
		const res = await listRoomRentPaymentCharges(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 500 when database error occurs on payments query", async () => {
		mockAuthenticatedUser();
		mockPaymentsEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/rent-payment-charges`,
		);
		const res = await listRoomRentPaymentCharges(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});

	it("should return 500 when database error occurs on charges query", async () => {
		mockAuthenticatedUser();
		mockPaymentsEq2.mockResolvedValue({
			data: [{ id: PAYMENT_1_ID }],
			error: null,
		});
		mockChargesIn.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/rent-payment-charges`,
		);
		const res = await listRoomRentPaymentCharges(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
