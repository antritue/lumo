import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomInput } from "@/lib/validations/room";
import { createRoom, listRooms } from "./route";

// Mock the server client
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockEq2 = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: mockFrom,
	})),
}));

describe("GET /api/rooms", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for select -> eq -> eq
		mockFrom.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
	});

	const createRequest = (propertyId?: string) => {
		const url = propertyId
			? `http://localhost:3000/api/rooms?propertyId=${propertyId}`
			: "http://localhost:3000/api/rooms";
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

	it("should return 200 with list of rooms for authenticated user", async () => {
		mockAuthenticatedUser();
		const mockRooms = [
			{
				id: "room-1",
				name: "Room A",
				property_id: "prop-1",
				user_id: "test-user-id",
			},
			{
				id: "room-2",
				name: "Room B",
				property_id: "prop-1",
				user_id: "test-user-id",
			},
		];
		mockEq2.mockResolvedValue({
			data: mockRooms,
			error: null,
		});

		const req = createRequest("prop-1");
		const res = await listRooms(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([
			{
				id: "room-1",
				name: "Room A",
				propertyId: "prop-1",
				userId: "test-user-id",
			},
			{
				id: "room-2",
				name: "Room B",
				propertyId: "prop-1",
				userId: "test-user-id",
			},
		]);
		expect(mockSelect).toHaveBeenCalledWith("*");
		expect(mockEq).toHaveBeenCalledWith("user_id", "test-user-id");
		expect(mockEq2).toHaveBeenCalledWith("property_id", "prop-1");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("prop-1");
		const res = await listRooms(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when propertyId is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest();
		const res = await listRooms(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBe("propertyId is required");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("prop-1");
		const res = await listRooms(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("POST /api/rooms", () => {
	// Property existence chain: select -> eq -> eq -> single
	const mockPropertySelect = vi.fn();
	const mockPropertyEq = vi.fn();
	const mockPropertyEq2 = vi.fn();
	const mockPropertySingle = vi.fn();

	// Entitlement chain: select -> eq -> maybeSingle
	const mockEntitlementSelect = vi.fn();
	const mockEntitlementEq = vi.fn();
	const mockEntitlementMaybeSingle = vi.fn();

	// Room count chain: select -> eq
	const mockCountSelect = vi.fn();
	const mockCountEq = vi.fn();

	// Room insert chain: insert -> select -> single
	const mockRoomInsert = vi.fn();
	const mockRoomInsertSelect = vi.fn();
	const mockRoomInsertSingle = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		// Property chain
		mockPropertySelect.mockReturnValue({ eq: mockPropertyEq });
		mockPropertyEq.mockReturnValue({ eq: mockPropertyEq2 });
		mockPropertyEq2.mockReturnValue({ single: mockPropertySingle });

		// Entitlement chain (default: no entitlement → free)
		mockEntitlementSelect.mockReturnValue({ eq: mockEntitlementEq });
		mockEntitlementEq.mockReturnValue({
			maybeSingle: mockEntitlementMaybeSingle,
		});
		mockEntitlementMaybeSingle.mockResolvedValue({ data: null, error: null });

		// Count chain (default: 0 rooms)
		mockCountSelect.mockReturnValue({ eq: mockCountEq });
		mockCountEq.mockResolvedValue({ count: 0, error: null });

		// Insert chain
		mockRoomInsert.mockReturnValue({ select: mockRoomInsertSelect });
		mockRoomInsertSelect.mockReturnValue({ single: mockRoomInsertSingle });

		mockFrom.mockImplementation((table: string) => {
			if (table === "properties") {
				return { select: mockPropertySelect };
			}
			if (table === "user_entitlements") {
				return { select: mockEntitlementSelect };
			}
			return { select: mockCountSelect, insert: mockRoomInsert };
		});
	});

	const createRequest = (
		body: Partial<RoomInput> | Record<string, unknown>,
	) => {
		return new NextRequest("http://localhost:3000/api/rooms", {
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

	const mockPropertyExists = () => {
		mockPropertySingle.mockResolvedValue({
			data: { id: "prop-1" },
			error: null,
		});
	};

	const mockPropertyMissing = () => {
		mockPropertySingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116" },
		});
	};

	const mockNoEntitlement = () => {
		mockEntitlementMaybeSingle.mockResolvedValue({ data: null, error: null });
	};

	const mockPaidEntitlement = () => {
		mockEntitlementMaybeSingle.mockResolvedValue({
			data: {
				id: "ent-1",
				user_id: "test-user-id",
				polar_customer_id: "cust-1",
				tier: "lifetime",
				status: "active",
				current_period_end: null,
			},
			error: null,
		});
	};

	const mockRoomCount = (count: number) => {
		mockCountEq.mockResolvedValue({ count, error: null });
	};

	const mockInsertSuccess = () => {
		mockRoomInsertSingle.mockResolvedValue({
			data: {
				id: "new-room-id",
				name: "Room 101",
				property_id: "prop-1",
				user_id: "test-user-id",
				monthly_rent: 500,
				notes: null,
			},
			error: null,
		});
	};

	const validBody = {
		name: "Room 101",
		propertyId: "550e8400-e29b-41d4-a716-446655440000",
		monthlyRent: 500,
	};

	it("should return 201 when authenticated user creates a room", async () => {
		mockAuthenticatedUser();
		mockPropertyExists();
		mockNoEntitlement();
		mockRoomCount(0);
		mockInsertSuccess();

		const req = createRequest(validBody);
		const res = await createRoom(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data).toEqual({
			id: "new-room-id",
			name: "Room 101",
			propertyId: "prop-1",
			userId: "test-user-id",
			monthlyRent: 500,
			notes: null,
		});
	});

	it("should return 403 with ROOM_LIMIT_REACHED when free user is at the room cap", async () => {
		mockAuthenticatedUser();
		mockPropertyExists();
		mockNoEntitlement();
		mockRoomCount(5);

		const req = createRequest(validBody);
		const res = await createRoom(req);
		const data = await res.json();

		expect(res.status).toBe(403);
		expect(data.error).toBe("ROOM_LIMIT_REACHED");
		expect(mockRoomInsert).not.toHaveBeenCalled();
	});

	it("should return 201 when paid user exceeds the free room cap", async () => {
		mockAuthenticatedUser();
		mockPropertyExists();
		mockPaidEntitlement();
		mockRoomCount(10);
		mockInsertSuccess();

		const req = createRequest(validBody);
		const res = await createRoom(req);

		expect(res.status).toBe(201);
		expect(mockRoomInsert).toHaveBeenCalled();
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest(validBody);
		const res = await createRoom(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when name is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			propertyId: "550e8400-e29b-41d4-a716-446655440000",
		});
		const res = await createRoom(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 400 when propertyId is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ name: "Room 101" });
		const res = await createRoom(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 404 when property does not exist", async () => {
		mockAuthenticatedUser();
		mockPropertyMissing();

		const req = createRequest(validBody);
		const res = await createRoom(req);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Property not found");
	});

	it("should return 500 when database error occurs during insert", async () => {
		mockAuthenticatedUser();
		mockPropertyExists();
		mockNoEntitlement();
		mockRoomCount(0);
		mockRoomInsertSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest(validBody);
		const res = await createRoom(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
