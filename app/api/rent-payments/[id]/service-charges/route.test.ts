import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, PATCH } from "./route";

const PAYMENT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_ID = "bbbbbbbb-bbbb-4bbb-9bbb-bbbbbbbbbbbb";

const mockGetUser = vi.fn();
const mockPaymentSelect = vi.fn();
const mockPaymentEq = vi.fn();
const mockPaymentSingle = vi.fn();
const mockChargesSelect = vi.fn();
const mockChargesEq = vi.fn();
const mockUpsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: { getUser: mockGetUser },
		from: mockFrom,
	})),
}));

describe("GET /api/rent-payments/:id/service-charges", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockImplementation((table: string) => {
			if (table === "rent_payments") {
				return { select: mockPaymentSelect };
			}
			return { select: mockChargesSelect };
		});
		mockPaymentSelect.mockReturnValue({ eq: mockPaymentEq });
		mockPaymentEq.mockReturnValue({
			eq: mockPaymentEq,
			single: mockPaymentSingle,
		});
		mockChargesSelect.mockReturnValue({ eq: mockChargesEq });
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

	it("should return 200 with list of charges for authenticated user", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: { id: PAYMENT_ID, user_id: USER_ID },
			error: null,
		});
		const mockRows = [
			{
				id: "charge-1",
				rent_payment_id: PAYMENT_ID,
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
				rent_payment_id: PAYMENT_ID,
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
		];
		mockChargesEq.mockResolvedValue({ data: mockRows, error: null });

		const req = new NextRequest(
			`http://localhost:3000/api/rent-payments/${PAYMENT_ID}/service-charges`,
		);
		const res = await GET(req, createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([
			{
				id: "charge-1",
				rentPaymentId: PAYMENT_ID,
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
				rentPaymentId: PAYMENT_ID,
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
		]);
		expect(mockPaymentSelect).toHaveBeenCalledWith("id");
		expect(mockPaymentEq).toHaveBeenNthCalledWith(1, "id", PAYMENT_ID);
		expect(mockPaymentEq).toHaveBeenNthCalledWith(2, "user_id", USER_ID);
		expect(mockChargesEq).toHaveBeenCalledWith("rent_payment_id", PAYMENT_ID);
	});

	it("should return 200 with empty array when no charges exist", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: { id: PAYMENT_ID, user_id: USER_ID },
			error: null,
		});
		mockChargesEq.mockResolvedValue({ data: [], error: null });

		const req = new NextRequest(
			`http://localhost:3000/api/rent-payments/${PAYMENT_ID}/service-charges`,
		);
		const res = await GET(req, createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = new NextRequest(
			`http://localhost:3000/api/rent-payments/${PAYMENT_ID}/service-charges`,
		);
		const res = await GET(req, createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when payment is not found", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows found" },
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rent-payments/${PAYMENT_ID}/service-charges`,
		);
		const res = await GET(req, createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Payment not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: { id: PAYMENT_ID, user_id: USER_ID },
			error: null,
		});
		mockChargesEq.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rent-payments/${PAYMENT_ID}/service-charges`,
		);
		const res = await GET(req, createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("PATCH /api/rent-payments/:id/service-charges", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockFrom.mockImplementation((table: string) => {
			if (table === "rent_payments") {
				return { select: mockPaymentSelect };
			}
			return {
				select: mockChargesSelect,
				upsert: mockUpsert,
			};
		});
		mockPaymentSelect.mockReturnValue({ eq: mockPaymentEq });
		mockPaymentEq.mockReturnValue({
			eq: mockPaymentEq,
			single: mockPaymentSingle,
		});
		mockChargesSelect.mockReturnValue({ eq: mockChargesEq });
		mockUpsert.mockReturnValue({});
	});

	const createRequest = (body: unknown) => {
		return new NextRequest(
			`http://localhost:3000/api/rent-payments/${PAYMENT_ID}/service-charges`,
			{
				method: "PATCH",
				body: JSON.stringify(body),
			},
		);
	};

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

	it("should return 200 with saved charges for authenticated user", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: { id: PAYMENT_ID, user_id: USER_ID },
			error: null,
		});
		mockChargesEq.mockResolvedValueOnce({
			// re-fetch
			data: [
				{
					id: "charge-1",
					rent_payment_id: PAYMENT_ID,
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
			],
			error: null,
		});

		const res = await PATCH(
			createRequest([
				{
					serviceId: "water",
					serviceName: "Water",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 30,
					usage: null,
				},
			]),
			createParams(PAYMENT_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toHaveLength(1);
		expect(data[0].serviceId).toBe("water");
		expect(data[0].total).toBe(30);
		expect(mockUpsert).toHaveBeenCalledWith(
			[
				{
					rent_payment_id: PAYMENT_ID,
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
			],
			{ onConflict: "rent_payment_id, service_id" },
		);
	});

	it("should return 200 with empty array when saving empty charges", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: { id: PAYMENT_ID, user_id: USER_ID },
			error: null,
		});
		mockChargesEq.mockResolvedValueOnce({ data: [], error: null }); // re-fetch

		const res = await PATCH(createRequest([]), createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([]);
		expect(mockUpsert).not.toHaveBeenCalled();
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const res = await PATCH(createRequest([]), createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when body is not an array", async () => {
		mockAuthenticatedUser();

		const res = await PATCH(
			createRequest({ not: "an array" }),
			createParams(PAYMENT_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 404 when payment is not found", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows found" },
		});

		const res = await PATCH(createRequest([]), createParams(PAYMENT_ID));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Payment not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockPaymentSingle.mockResolvedValue({
			data: { id: PAYMENT_ID, user_id: USER_ID },
			error: null,
		});
		mockUpsert.mockImplementation(() => {
			throw new Error("DB failure");
		});

		const res = await PATCH(
			createRequest([
				{
					serviceId: "water",
					serviceName: "Water",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 30,
					usage: null,
				},
			]),
			createParams(PAYMENT_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
