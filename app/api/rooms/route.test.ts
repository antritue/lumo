import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomInput } from "@/lib/validations/room";
import { GET, POST } from "./route";

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
			? `http://localhost/api/rooms?property_id=${propertyId}`
			: "http://localhost/api/rooms";
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
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual(mockRooms);
		expect(mockSelect).toHaveBeenCalledWith("*");
		expect(mockEq).toHaveBeenCalledWith("user_id", "test-user-id");
		expect(mockEq2).toHaveBeenCalledWith("property_id", "prop-1");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("prop-1");
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when property_id is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest();
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBe("property_id is required");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("prop-1");
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("POST /api/rooms", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createRequest = (
		body: Partial<RoomInput> | Record<string, unknown>,
	) => {
		return new NextRequest("http://localhost/api/rooms", {
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

	const setupPropertyCheckMock = (exists: boolean) => {
		const mockPropertySelect = vi.fn();
		const mockPropertyEq = vi.fn();
		const mockPropertyEq2 = vi.fn();
		const mockPropertySingle = vi.fn();

		mockPropertySelect.mockReturnValue({ eq: mockPropertyEq });
		mockPropertyEq.mockReturnValue({ eq: mockPropertyEq2 });
		mockPropertyEq2.mockReturnValue({ single: mockPropertySingle });
		mockPropertySingle.mockResolvedValue({
			data: exists ? { id: "prop-1" } : null,
			error: exists ? null : { code: "PGRST116" },
		});

		return mockPropertySelect;
	};

	const setupInsertMock = (data: unknown, error: unknown = null) => {
		const mockRoomInsert = vi.fn();
		const mockRoomSelect = vi.fn();
		const mockRoomSingle = vi.fn();

		mockRoomInsert.mockReturnValue({ select: mockRoomSelect });
		mockRoomSelect.mockReturnValue({ single: mockRoomSingle });
		mockRoomSingle.mockResolvedValue({ data, error });

		return mockRoomInsert;
	};

	it("should return 201 when authenticated user creates a room", async () => {
		mockAuthenticatedUser();

		const mockPropertySelect = setupPropertyCheckMock(true);
		const mockRoomInsert = setupInsertMock({
			id: "new-room-id",
			name: "Room 101",
			property_id: "prop-1",
			user_id: "test-user-id",
			monthly_rent: 500,
			notes: null,
		});

		mockFrom.mockImplementation((table: string) => {
			if (table === "properties") {
				return { select: mockPropertySelect };
			}
			return { insert: mockRoomInsert };
		});

		const req = createRequest({
			name: "Room 101",
			propertyId: "550e8400-e29b-41d4-a716-446655440000",
			monthlyRent: 500,
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.name).toBe("Room 101");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({
			name: "Room 101",
			propertyId: "550e8400-e29b-41d4-a716-446655440000",
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when name is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({
			propertyId: "550e8400-e29b-41d4-a716-446655440000",
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 400 when propertyId is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ name: "Room 101" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 404 when property does not exist", async () => {
		mockAuthenticatedUser();

		const mockPropertySelect = setupPropertyCheckMock(false);
		mockFrom.mockImplementation((table: string) => {
			if (table === "properties") {
				return { select: mockPropertySelect };
			}
			return {};
		});

		const req = createRequest({
			name: "Room 101",
			propertyId: "550e8400-e29b-41d4-a716-446655440000",
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Property not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();

		const mockPropertySelect = setupPropertyCheckMock(true);
		const mockRoomInsert = setupInsertMock(null, {
			code: "some-error",
			message: "DB failure",
		});

		mockFrom.mockImplementation((table: string) => {
			if (table === "properties") {
				return { select: mockPropertySelect };
			}
			return { insert: mockRoomInsert };
		});

		const req = createRequest({
			name: "Room 101",
			propertyId: "550e8400-e29b-41d4-a716-446655440000",
		});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
