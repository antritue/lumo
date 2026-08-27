import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const USER_ID = "bbbbbbbb-bbbb-4bbb-9bbb-bbbbbbbbbbbb";
const PERIOD = "2026-08";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockPropertiesSelect = vi.fn();
const mockPropertiesEq = vi.fn();
const mockRoomsSelect = vi.fn();
const mockRoomsEq = vi.fn();
const mockPaymentsSelect = vi.fn();
const mockPaymentsEq1 = vi.fn();
const mockPaymentsEq2 = vi.fn();
const mockPaymentsIn = vi.fn();
const mockChargesSelect = vi.fn();
const mockChargesIn = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: { getUser: mockGetUser },
		from: mockFrom,
	})),
}));

beforeEach(() => {
	vi.clearAllMocks();
	mockFrom.mockImplementation((table: string) => {
		if (table === "properties") return { select: mockPropertiesSelect };
		if (table === "rooms") return { select: mockRoomsSelect };
		if (table === "rent_payments") return { select: mockPaymentsSelect };
		return { select: mockChargesSelect };
	});
	mockPropertiesSelect.mockReturnValue({ eq: mockPropertiesEq });
	mockPropertiesEq.mockResolvedValue({ data: [], error: null });
	mockRoomsSelect.mockReturnValue({ eq: mockRoomsEq });
	mockRoomsEq.mockResolvedValue({ data: [], error: null });
	mockPaymentsSelect.mockReturnValue({ eq: mockPaymentsEq1 });
	mockPaymentsEq1.mockReturnValue({ eq: mockPaymentsEq2 });
	mockPaymentsEq2.mockReturnValue({ in: mockPaymentsIn });
	mockPaymentsIn.mockResolvedValue({ data: [], error: null });
	mockChargesSelect.mockReturnValue({ in: mockChargesIn });
	mockChargesIn.mockResolvedValue({ data: [], error: null });
});

const mockAuthenticatedUser = () => {
	mockGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
};

const createRequest = (query = "") =>
	new NextRequest(`http://localhost:3000/api/overview${query}`);

describe("GET /api/overview", () => {
	it("returns 401 when unauthenticated", async () => {
		mockGetUser.mockResolvedValue({ data: { user: null } });

		const res = await GET(createRequest(`?period=${PERIOD}`));

		expect(res.status).toBe(401);
	});

	it("returns 400 when period is missing", async () => {
		mockAuthenticatedUser();

		const res = await GET(createRequest());

		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toBe("period is required");
	});

	it("returns 400 when period is invalid", async () => {
		mockAuthenticatedUser();

		const res = await GET(createRequest("?period=2026/08"));

		expect(res.status).toBe(400);
	});

	it("returns composed snapshot when data exists", async () => {
		mockAuthenticatedUser();
		mockPropertiesEq.mockResolvedValue({
			data: [{ id: "prop-1", name: "Villa Sunrise" }],
			error: null,
		});
		mockRoomsEq.mockResolvedValue({
			data: [
				{
					id: "room-1",
					property_id: "prop-1",
					name: "Room 101",
					monthly_rent: 800,
				},
				{
					id: "room-2",
					property_id: "prop-1",
					name: "Room 102",
					monthly_rent: 700,
				},
			],
			error: null,
		});
		mockPaymentsIn.mockResolvedValue({
			data: [
				{
					id: "pay-1",
					room_id: "room-1",
					period: PERIOD,
					rent_amount: 800,
					status: "paid",
				},
			],
			error: null,
		});
		mockChargesIn.mockResolvedValue({
			data: [
				{
					id: "charge-1",
					rent_payment_id: "pay-1",
					user_id: USER_ID,
					service_id: "parking",
					service_name: "Parking",
					pricing_type: "flat",
					unit_label: null,
					unit_price: null,
					flat_amount: 50,
					usage: null,
					total: 50,
				},
			],
			error: null,
		});

		const res = await GET(createRequest(`?period=${PERIOD}`));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.period).toBe(PERIOD);
		expect(data.properties).toEqual([{ id: "prop-1", name: "Villa Sunrise" }]);
		expect(data.rooms[0]).toEqual({
			id: "room-1",
			propertyId: "prop-1",
			name: "Room 101",
			monthlyRent: 800,
			payment: {
				id: "pay-1",
				roomId: "room-1",
				period: PERIOD,
				rentAmount: 800,
				status: "paid",
			},
			charges: [
				{
					id: "charge-1",
					rentPaymentId: "pay-1",
					userId: USER_ID,
					serviceId: "parking",
					serviceName: "Parking",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 50,
					usage: null,
					total: 50,
				},
			],
			total: 850,
		});
		expect(data.rooms[1]).toEqual({
			id: "room-2",
			propertyId: "prop-1",
			name: "Room 102",
			monthlyRent: 700,
			payment: null,
			charges: [],
			total: 0,
		});
	});

	it("returns empty rooms without querying payments", async () => {
		mockAuthenticatedUser();
		mockPropertiesEq.mockResolvedValue({
			data: [{ id: "prop-1", name: "Villa Sunrise" }],
			error: null,
		});
		mockRoomsEq.mockResolvedValue({ data: [], error: null });

		const res = await GET(createRequest(`?period=${PERIOD}`));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.rooms).toEqual([]);
		expect(mockPaymentsSelect).not.toHaveBeenCalled();
	});

	it("returns 500 on supabase error", async () => {
		mockAuthenticatedUser();
		mockPropertiesEq.mockResolvedValue({ data: null, error: null });
		mockRoomsEq.mockResolvedValue({
			data: null,
			error: new Error("boom"),
		});

		const res = await GET(createRequest(`?period=${PERIOD}`));

		expect(res.status).toBe(500);
	});
});
