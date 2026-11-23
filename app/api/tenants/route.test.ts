import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TenantInput } from "@/lib/validations/tenant";
import { createTenant, listTenants } from "./route";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

// List chain: select -> eq
const mockSelect = vi.fn();
const mockEq = vi.fn();

// Room existence chain: select -> eq -> eq -> single
const mockRoomSelect = vi.fn();
const mockRoomEq = vi.fn();
const mockRoomEq2 = vi.fn();
const mockRoomSingle = vi.fn();

// Insert chain: insert -> select -> single
const mockInsert = vi.fn();
const mockInsertSelect = vi.fn();
const mockInsertSingle = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: mockFrom,
	})),
}));

beforeEach(() => {
	vi.clearAllMocks();

	mockSelect.mockReturnValue({ eq: mockEq });

	mockRoomSelect.mockReturnValue({ eq: mockRoomEq });
	mockRoomEq.mockReturnValue({ eq: mockRoomEq2 });
	mockRoomEq2.mockReturnValue({ single: mockRoomSingle });

	mockInsert.mockReturnValue({ select: mockInsertSelect });
	mockInsertSelect.mockReturnValue({ single: mockInsertSingle });

	mockFrom.mockImplementation((table: string) => {
		if (table === "rooms") {
			return { select: mockRoomSelect };
		}
		return { select: mockSelect, insert: mockInsert };
	});
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

describe("GET /api/tenants", () => {
	it("should return 200 with list of tenants for authenticated user", async () => {
		mockAuthenticatedUser();
		const mockTenants = [
			{
				id: "tenant-1",
				user_id: "test-user-id",
				room_id: "room-1",
				full_name: "Anh Nguyen",
				phone: "0901 234 567",
				email: "anh@example.com",
				notes: null,
			},
			{
				id: "tenant-2",
				user_id: "test-user-id",
				room_id: null,
				full_name: "Binh Le",
				phone: null,
				email: null,
				notes: "Moved out",
			},
		];
		mockEq.mockResolvedValue({
			data: mockTenants,
			error: null,
		});

		const res = await listTenants();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([
			{
				id: "tenant-1",
				userId: "test-user-id",
				roomId: "room-1",
				fullName: "Anh Nguyen",
				phone: "0901 234 567",
				email: "anh@example.com",
				notes: null,
			},
			{
				id: "tenant-2",
				userId: "test-user-id",
				roomId: null,
				fullName: "Binh Le",
				phone: null,
				email: null,
				notes: "Moved out",
			},
		]);
		expect(mockSelect).toHaveBeenCalledWith("*");
		expect(mockEq).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 200 with an empty list when the user has no tenants", async () => {
		mockAuthenticatedUser();
		mockEq.mockResolvedValue({
			data: [],
			error: null,
		});

		const res = await listTenants();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const res = await listTenants();
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const res = await listTenants();
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("POST /api/tenants", () => {
	const validBody: TenantInput = {
		fullName: "Anh Nguyen",
		roomId: "550e8400-e29b-41d4-a716-446655440000",
		phone: "0901 234 567",
		email: "anh@example.com",
		notes: null,
	};

	const createRequest = (
		body: Partial<TenantInput> | Record<string, unknown>,
	) => {
		return new NextRequest("http://localhost:3000/api/tenants", {
			method: "POST",
			body: JSON.stringify(body),
		});
	};

	const mockRoomExists = () => {
		mockRoomSingle.mockResolvedValue({
			data: { id: "550e8400-e29b-41d4-a716-446655440000" },
			error: null,
		});
	};

	const mockRoomMissing = () => {
		mockRoomSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116" },
		});
	};

	const mockInsertSuccess = () => {
		mockInsertSingle.mockResolvedValue({
			data: {
				id: "new-tenant-id",
				user_id: "test-user-id",
				room_id: "550e8400-e29b-41d4-a716-446655440000",
				full_name: "Anh Nguyen",
				phone: "0901 234 567",
				email: "anh@example.com",
				notes: null,
			},
			error: null,
		});
	};

	it("should return 201 when authenticated user creates a tenant", async () => {
		mockAuthenticatedUser();
		mockRoomExists();
		mockInsertSuccess();

		const res = await createTenant(createRequest(validBody));
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data).toEqual({
			id: "new-tenant-id",
			userId: "test-user-id",
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			fullName: "Anh Nguyen",
			phone: "0901 234 567",
			email: "anh@example.com",
			notes: null,
		});
		expect(mockInsert).toHaveBeenCalledWith([
			{
				user_id: "test-user-id",
				room_id: "550e8400-e29b-41d4-a716-446655440000",
				full_name: "Anh Nguyen",
				phone: "0901 234 567",
				email: "anh@example.com",
				notes: null,
			},
		]);
	});

	it("should create an inactive tenant without checking for a room", async () => {
		mockAuthenticatedUser();
		mockInsertSingle.mockResolvedValue({
			data: {
				id: "new-tenant-id",
				user_id: "test-user-id",
				room_id: null,
				full_name: "Binh Le",
				phone: null,
				email: null,
				notes: null,
			},
			error: null,
		});

		const res = await createTenant(
			createRequest({
				fullName: "Binh Le",
				roomId: null,
				phone: null,
				email: null,
				notes: null,
			}),
		);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.roomId).toBeNull();
		expect(mockRoomSelect).not.toHaveBeenCalled();
		expect(mockInsert).toHaveBeenCalledWith([
			expect.objectContaining({ room_id: null }),
		]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const res = await createTenant(createRequest(validBody));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when fullName is missing", async () => {
		mockAuthenticatedUser();

		const res = await createTenant(createRequest({ roomId: null }));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 400 when roomId is not a valid UUID", async () => {
		mockAuthenticatedUser();

		const res = await createTenant(
			createRequest({ fullName: "Anh Nguyen", roomId: "not-a-uuid" }),
		);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 400 when email is invalid", async () => {
		mockAuthenticatedUser();

		const res = await createTenant(
			createRequest({ fullName: "Anh Nguyen", email: "not-an-email" }),
		);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 404 when the room does not belong to the user", async () => {
		mockAuthenticatedUser();
		mockRoomMissing();

		const res = await createTenant(createRequest(validBody));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room not found");
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("should return 409 when the room already has an active tenant", async () => {
		mockAuthenticatedUser();
		mockRoomExists();
		mockInsertSingle.mockResolvedValue({
			data: null,
			error: { code: "23505", message: "duplicate key value" },
		});

		const res = await createTenant(createRequest(validBody));
		const data = await res.json();

		expect(res.status).toBe(409);
		expect(data.error).toBe("Room already has an active tenant");
	});

	it("should return 500 when database error occurs during insert", async () => {
		mockAuthenticatedUser();
		mockRoomExists();
		mockInsertSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const res = await createTenant(createRequest(validBody));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
