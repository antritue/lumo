import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomServiceOverrideInput } from "@/lib/validations/room-service";
import { listRoomServiceOverrides, upsertRoomServiceOverride } from "./route";

const ROOM_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_ID = "bbbbbbbb-bbbb-4bbb-9bbb-bbbbbbbbbbbb";
const SVC_1_ID = "cccccccc-cccc-4ccc-accc-cccccccccccc";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: { getUser: mockGetUser },
		from: mockFrom,
	})),
}));

describe("GET /api/rooms/[id]/service-overrides", () => {
	beforeEach(() => {
		vi.clearAllMocks();
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

	it("should return 200 with override rows for authenticated user", async () => {
		mockAuthenticatedUser();

		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockResolvedValue({
					data: [
						{
							id: "ov-1",
							room_id: ROOM_ID,
							service_id: SVC_1_ID,
							user_id: USER_ID,
							is_enabled: false,
							custom_flat_amount: null,
							custom_unit_price: null,
						},
					],
					error: null,
				}),
			}),
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/service-overrides`,
		);
		const res = await listRoomServiceOverrides(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([
			{
				id: "ov-1",
				room_id: ROOM_ID,
				service_id: SVC_1_ID,
				user_id: USER_ID,
				is_enabled: false,
				custom_flat_amount: null,
				custom_unit_price: null,
			},
		]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/service-overrides`,
		);
		const res = await listRoomServiceOverrides(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();

		mockFrom.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockResolvedValue({
					data: null,
					error: { code: "some-error", message: "DB failure" },
				}),
			}),
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/service-overrides`,
		);
		const res = await listRoomServiceOverrides(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("POST /api/rooms/[id]/service-overrides", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createParams = (id: string) => ({
		params: Promise.resolve({ id }),
	});

	const createRequest = (
		body: Partial<RoomServiceOverrideInput> | Record<string, unknown>,
	) => {
		return new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/service-overrides`,
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

	it("should return 200 when upserting an override", async () => {
		mockAuthenticatedUser();

		mockFrom.mockReturnValue({
			upsert: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: {
							id: "ov-1",
							room_id: ROOM_ID,
							service_id: SVC_1_ID,
							user_id: USER_ID,
							is_enabled: false,
							custom_flat_amount: null,
							custom_unit_price: null,
						},
						error: null,
					}),
				}),
			}),
		});

		const req = createRequest({
			serviceId: SVC_1_ID,
			isEnabled: false,
		});
		const res = await upsertRoomServiceOverride(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			id: "ov-1",
			room_id: ROOM_ID,
			service_id: SVC_1_ID,
			user_id: USER_ID,
			is_enabled: false,
			custom_flat_amount: null,
			custom_unit_price: null,
		});
	});

	it("should return null when upsert results in no-op override", async () => {
		mockAuthenticatedUser();

		const mockDelete = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({ error: null }),
		});
		mockFrom.mockReturnValue({
			upsert: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: {
							id: "ov-1",
							room_id: ROOM_ID,
							service_id: SVC_1_ID,
							user_id: USER_ID,
							is_enabled: true,
							custom_flat_amount: null,
							custom_unit_price: null,
						},
						error: null,
					}),
				}),
			}),
			delete: mockDelete,
		});

		const req = createRequest({
			serviceId: SVC_1_ID,
			isEnabled: true,
		});
		const res = await upsertRoomServiceOverride(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeNull();
		expect(mockDelete).toHaveBeenCalled();
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({ serviceId: SVC_1_ID });
		const res = await upsertRoomServiceOverride(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when required field is missing in an item", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ isEnabled: true });
		const res = await upsertRoomServiceOverride(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();

		mockFrom.mockReturnValue({
			upsert: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: null,
						error: { code: "some-error", message: "DB failure" },
					}),
				}),
			}),
		});

		const req = createRequest({
			serviceId: SVC_1_ID,
			isEnabled: true,
		});
		const res = await upsertRoomServiceOverride(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
