import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomInput } from "@/lib/validations/room";
import { DELETE, GET, PATCH } from "./route";

// Mock the server client
const mockGetUser = vi.fn();
const mockDelete = vi.fn();
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
			delete: mockDelete,
			update: mockUpdate,
			select: mockSelect,
		})),
	})),
}));

describe("GET /api/rooms/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for select -> eq -> eq -> single
		mockSelect.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
		mockEq2.mockReturnValue({ single: mockSingle });
	});

	const createRequest = (id: string) => {
		return new NextRequest(`http://localhost/api/rooms/${id}`, {
			method: "GET",
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

	it("should return 200 with room for authenticated user", async () => {
		mockAuthenticatedUser();
		const mockRoom = {
			id: "room-1",
			name: "Room A",
			property_id: "prop-1",
			user_id: "test-user-id",
			monthly_rent: 500,
			notes: null,
		};
		mockSingle.mockResolvedValue({
			data: mockRoom,
			error: null,
		});

		const req = createRequest("room-1");
		const res = await GET(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual(mockRoom);
		expect(mockSelect).toHaveBeenCalledWith("*");
		expect(mockEq).toHaveBeenCalledWith("id", "room-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("room-1");
		const res = await GET(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when room is not found", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows found" },
		});

		const req = createRequest("non-existent-id");
		const res = await GET(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("room-1");
		const res = await GET(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("DELETE /api/rooms/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for delete -> eq -> eq
		mockDelete.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
	});

	const createRequest = (id: string) => {
		return new NextRequest(`http://localhost/api/rooms/${id}`, {
			method: "DELETE",
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

	it("should return 204 when authenticated user deletes their room", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 1,
		});

		const req = createRequest("room-1");
		const res = await DELETE(req, createParams("room-1"));

		expect(res.status).toBe(204);
		expect(mockDelete).toHaveBeenCalledWith({ count: "exact" });
		expect(mockEq).toHaveBeenCalledWith("id", "room-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("room-1");
		const res = await DELETE(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when room is not found", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 0,
		});

		const req = createRequest("non-existent-id");
		const res = await DELETE(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("room-1");
		const res = await DELETE(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("PATCH /api/rooms/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for update -> eq -> eq -> select -> single
		mockUpdate.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
		mockEq2.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ single: mockSingle });
	});

	const createRequest = (
		id: string,
		body: Partial<RoomInput> | Record<string, unknown>,
	) => {
		return new NextRequest(`http://localhost/api/rooms/${id}`, {
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

	it("should return 200 when authenticated user updates their room name", async () => {
		mockAuthenticatedUser();
		const mockRoom = {
			id: "room-1",
			name: "Updated Room",
			property_id: "prop-1",
			user_id: "test-user-id",
			monthly_rent: 500,
			notes: null,
		};
		mockSingle.mockResolvedValue({
			data: mockRoom,
			error: null,
		});

		const req = createRequest("room-1", { name: "Updated Room" });
		const res = await PATCH(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual(mockRoom);
		expect(mockUpdate).toHaveBeenCalledWith({ name: "Updated Room" });
		expect(mockEq).toHaveBeenCalledWith("id", "room-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 200 when authenticated user updates monthly rent", async () => {
		mockAuthenticatedUser();
		const mockRoom = {
			id: "room-1",
			name: "Room A",
			property_id: "prop-1",
			user_id: "test-user-id",
			monthly_rent: 750,
			notes: null,
		};
		mockSingle.mockResolvedValue({
			data: mockRoom,
			error: null,
		});

		const req = createRequest("room-1", { monthlyRent: 750 });
		const res = await PATCH(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.monthly_rent).toBe(750);
		expect(mockUpdate).toHaveBeenCalledWith({ monthly_rent: 750 });
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("room-1", { name: "Updated Room" });
		const res = await PATCH(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when room is not found", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows found" },
		});

		const req = createRequest("non-existent-id", { name: "Updated Room" });
		const res = await PATCH(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("room-1", { name: "Updated Room" });
		const res = await PATCH(req, createParams("room-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
