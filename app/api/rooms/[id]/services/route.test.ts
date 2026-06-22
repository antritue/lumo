import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomServiceInput } from "@/lib/validations/room-service";
import { createRoomService, listRoomServices } from "./route";

const ROOM_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_ID = "bbbbbbbb-bbbb-4bbb-9bbb-bbbbbbbbbbbb";
const SVC_1_ID = "cccccccc-cccc-4ccc-accc-cccccccccccc";
const SVC_2_ID = "dddddddd-dddd-4ddd-bddd-dddddddddddd";

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockEq2 = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			select: mockSelect,
			insert: mockInsert,
		})),
	})),
}));

describe("GET /api/rooms/[id]/services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSelect.mockReturnValue({ order: mockOrder });
		mockOrder.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
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

	it("should return 200 with list of room services for authenticated user", async () => {
		mockAuthenticatedUser();
		const mockRows = [
			{
				id: "rs-1",
				room_id: ROOM_ID,
				service_id: SVC_1_ID,
				user_id: USER_ID,
				service_name: "WiFi",
				pricing_type: "flat",
				flat_amount: 50,
				unit_price: null,
				unit_label: null,
			},
			{
				id: "rs-2",
				room_id: ROOM_ID,
				service_id: SVC_2_ID,
				user_id: USER_ID,
				service_name: "Electricity",
				pricing_type: "variable",
				flat_amount: null,
				unit_price: 0.15,
				unit_label: "kWh",
			},
		];
		mockEq2.mockResolvedValue({
			data: mockRows,
			error: null,
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/services`,
		);
		const res = await listRoomServices(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([
			{
				id: "rs-1",
				roomId: ROOM_ID,
				serviceId: SVC_1_ID,
				userId: USER_ID,
				serviceName: "WiFi",
				pricingType: "flat",
				flatAmount: 50,
				unitPrice: null,
				unitLabel: null,
			},
			{
				id: "rs-2",
				roomId: ROOM_ID,
				serviceId: SVC_2_ID,
				userId: USER_ID,
				serviceName: "Electricity",
				pricingType: "variable",
				flatAmount: null,
				unitPrice: 0.15,
				unitLabel: "kWh",
			},
		]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/services`,
		);
		const res = await listRoomServices(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/services`,
		);
		const res = await listRoomServices(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("POST /api/rooms/[id]/services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockInsert.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ single: mockSingle });
	});

	const createParams = (id: string) => ({
		params: Promise.resolve({ id }),
	});

	const createRequest = (
		body: Partial<RoomServiceInput> | Record<string, unknown>,
	) => {
		return new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/services`,
			{
				method: "POST",
				body: JSON.stringify(body),
			},
		);
	};

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

	it("should return 201 when creating a room service", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValueOnce({
			data: {
				id: "rs-1",
				room_id: ROOM_ID,
				service_id: SVC_1_ID,
				user_id: USER_ID,
				service_name: "WiFi",
				pricing_type: "flat",
				flat_amount: 50,
				unit_price: null,
				unit_label: null,
			},
			error: null,
		});

		const req = createRequest({
			serviceId: SVC_1_ID,
			serviceName: "WiFi",
			pricingType: "flat",
			flatAmount: 50,
		});
		const res = await createRoomService(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data).toEqual({
			id: "rs-1",
			roomId: ROOM_ID,
			serviceId: SVC_1_ID,
			userId: USER_ID,
			serviceName: "WiFi",
			pricingType: "flat",
			flatAmount: 50,
			unitPrice: null,
			unitLabel: null,
		});
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({
			serviceId: SVC_1_ID,
			pricingType: "flat",
		});
		const res = await createRoomService(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when required field is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ pricingType: "flat" });
		const res = await createRoomService(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValueOnce({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest({
			serviceId: SVC_1_ID,
			serviceName: "WiFi",
			pricingType: "flat",
		});
		const res = await createRoomService(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
