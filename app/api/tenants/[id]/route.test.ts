import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TenantInput } from "@/lib/validations/tenant";
import { deleteTenant, updateTenant } from "./route";

// Mock the server client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

// Delete chain: delete -> eq -> eq
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockEq2 = vi.fn();

// Update chain: update -> eq -> eq -> select -> single
const mockUpdate = vi.fn();
const mockUpdateSelect = vi.fn();
const mockUpdateSingle = vi.fn();

// Room existence chain: select -> eq -> eq -> single
const mockRoomSelect = vi.fn();
const mockRoomEq = vi.fn();
const mockRoomEq2 = vi.fn();
const mockRoomSingle = vi.fn();

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

	mockFrom.mockImplementation((table: string) => {
		if (table === "rooms") {
			return { select: mockRoomSelect };
		}
		return { delete: mockDelete, update: mockUpdate };
	});

	mockRoomSelect.mockReturnValue({ eq: mockRoomEq });
	mockRoomEq.mockReturnValue({ eq: mockRoomEq2 });
	mockRoomEq2.mockReturnValue({ single: mockRoomSingle });
});

const createRequest = (
	id: string,
	method: "DELETE" | "PATCH" = "DELETE",
	body?: Partial<TenantInput> | Record<string, unknown>,
) => {
	return new NextRequest(`http://localhost:3000/api/tenants/${id}`, {
		method,
		...(body ? { body: JSON.stringify(body) } : {}),
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

describe("DELETE /api/tenants/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for delete -> eq -> eq
		mockDelete.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
	});

	it("should return 204 when authenticated user deletes their tenant", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 1,
		});

		const req = createRequest("tenant-1");
		const res = await deleteTenant(req, createParams("tenant-1"));

		expect(res.status).toBe(204);
		expect(mockDelete).toHaveBeenCalledWith({ count: "exact" });
		expect(mockEq).toHaveBeenCalledWith("id", "tenant-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("tenant-1");
		const res = await deleteTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
		expect(mockDelete).not.toHaveBeenCalled();
	});

	it("should return 404 when tenant is not found", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 0,
		});

		const req = createRequest("non-existent-id");
		const res = await deleteTenant(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Tenant not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("tenant-1");
		const res = await deleteTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("PATCH /api/tenants/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for update -> eq -> eq -> select -> single
		mockUpdate.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
		mockEq2.mockReturnValue({ select: mockUpdateSelect });
		mockUpdateSelect.mockReturnValue({ single: mockUpdateSingle });
	});

	const updatedTenant = {
		id: "tenant-1",
		user_id: "test-user-id",
		room_id: "room-1",
		full_name: "Anh Nguyen",
		phone: "0901 234 567",
		email: "anh@example.com",
		notes: null,
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

	it("should return 200 when updating a single field", async () => {
		mockAuthenticatedUser();
		mockUpdateSingle.mockResolvedValue({
			data: { ...updatedTenant, full_name: "Updated Name" },
			error: null,
		});

		const req = createRequest("tenant-1", "PATCH", {
			fullName: "Updated Name",
		});
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			id: "tenant-1",
			userId: "test-user-id",
			roomId: "room-1",
			fullName: "Updated Name",
			phone: "0901 234 567",
			email: "anh@example.com",
			notes: null,
		});
		expect(mockUpdate).toHaveBeenCalledWith({ full_name: "Updated Name" });
		expect(mockEq).toHaveBeenCalledWith("id", "tenant-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 200 when updating contact details and the assigned room", async () => {
		mockAuthenticatedUser();
		mockRoomExists();
		mockUpdateSingle.mockResolvedValue({
			data: {
				...updatedTenant,
				room_id: "550e8400-e29b-41d4-a716-446655440000",
				phone: null,
				notes: "Quiet tenant",
			},
			error: null,
		});

		const req = createRequest("tenant-1", "PATCH", {
			fullName: "Anh Nguyen",
			roomId: "550e8400-e29b-41d4-a716-446655440000",
			phone: null,
			email: "anh@example.com",
			notes: "Quiet tenant",
		});
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.roomId).toBe("550e8400-e29b-41d4-a716-446655440000");
		expect(data.notes).toBe("Quiet tenant");
		expect(mockUpdate).toHaveBeenCalledWith({
			full_name: "Anh Nguyen",
			room_id: "550e8400-e29b-41d4-a716-446655440000",
			phone: null,
			email: "anh@example.com",
			notes: "Quiet tenant",
		});
	});

	it("should skip the room check and clear the assignment when roomId is null", async () => {
		mockAuthenticatedUser();
		mockUpdateSingle.mockResolvedValue({
			data: { ...updatedTenant, room_id: null },
			error: null,
		});

		const req = createRequest("tenant-1", "PATCH", {
			fullName: "Anh Nguyen",
			roomId: null,
		});
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.roomId).toBeNull();
		expect(mockRoomSelect).not.toHaveBeenCalled();
		expect(mockUpdate).toHaveBeenCalledWith({
			full_name: "Anh Nguyen",
			room_id: null,
		});
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("tenant-1", "PATCH", { fullName: "Anh" });
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
		expect(mockUpdate).not.toHaveBeenCalled();
	});

	it("should return 400 when fullName is empty", async () => {
		mockAuthenticatedUser();

		const req = createRequest("tenant-1", "PATCH", { fullName: "" });
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
		expect(mockUpdate).not.toHaveBeenCalled();
	});

	it("should return 400 when email is invalid", async () => {
		mockAuthenticatedUser();

		const req = createRequest("tenant-1", "PATCH", {
			email: "not-an-email",
		});
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 404 when the room does not belong to the user", async () => {
		mockAuthenticatedUser();
		mockRoomMissing();

		const req = createRequest("tenant-1", "PATCH", {
			roomId: "550e8400-e29b-41d4-a716-446655440000",
		});
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room not found");
		expect(mockUpdate).not.toHaveBeenCalled();
	});

	it("should return 404 when tenant is not found", async () => {
		mockAuthenticatedUser();
		mockUpdateSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows found" },
		});

		const req = createRequest("non-existent-id", "PATCH", {
			fullName: "Anh Nguyen",
		});
		const res = await updateTenant(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Tenant not found");
	});

	it("should return 409 when the room already has an active tenant", async () => {
		mockAuthenticatedUser();
		mockRoomExists();
		mockUpdateSingle.mockResolvedValue({
			data: null,
			error: { code: "23505", message: "duplicate key value" },
		});

		const req = createRequest("tenant-1", "PATCH", {
			roomId: "550e8400-e29b-41d4-a716-446655440000",
		});
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(409);
		expect(data.error).toBe("Room already has an active tenant");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockUpdateSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("tenant-1", "PATCH", {
			fullName: "Anh Nguyen",
		});
		const res = await updateTenant(req, createParams("tenant-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
