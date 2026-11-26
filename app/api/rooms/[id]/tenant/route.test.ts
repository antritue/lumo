import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRoomTenant } from "./route";

const ROOM_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_ID = "bbbbbbbb-bbbb-4bbb-9bbb-bbbbbbbbbbbb";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

const mockSelect = vi.fn();
const mockEqRoom = vi.fn();
const mockEqUser = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: { getUser: mockGetUser },
		from: mockFrom,
	})),
}));

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

beforeEach(() => {
	vi.clearAllMocks();

	mockSelect.mockReturnValue({ eq: mockEqRoom });
	mockEqRoom.mockReturnValue({ eq: mockEqUser });
	mockEqUser.mockReturnValue({ maybeSingle: mockMaybeSingle });
	mockFrom.mockReturnValue({ select: mockSelect });
});

describe("GET /api/rooms/[id]/tenant", () => {
	it("should return the active tenant for the room", async () => {
		mockAuthenticatedUser();
		mockMaybeSingle.mockResolvedValue({
			data: {
				id: "tenant-1",
				user_id: USER_ID,
				room_id: ROOM_ID,
				full_name: "Anh Nguyen",
				phone: "0901 234 567",
				email: "anh@example.com",
				notes: null,
			},
			error: null,
		});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/tenant`,
		);
		const res = await getRoomTenant(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			id: "tenant-1",
			userId: USER_ID,
			roomId: ROOM_ID,
			fullName: "Anh Nguyen",
			phone: "0901 234 567",
			email: "anh@example.com",
			notes: null,
		});
		expect(mockSelect).toHaveBeenCalledWith("*");
		expect(mockEqRoom).toHaveBeenCalledWith("room_id", ROOM_ID);
		expect(mockEqUser).toHaveBeenCalledWith("user_id", USER_ID);
	});

	it("should return null when the room has no active tenant", async () => {
		mockAuthenticatedUser();
		mockMaybeSingle.mockResolvedValue({ data: null, error: null });

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/tenant`,
		);
		const res = await getRoomTenant(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toBeNull();
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/tenant`,
		);
		const res = await getRoomTenant(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockMaybeSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const req = new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/tenant`,
		);
		const res = await getRoomTenant(req, createParams(ROOM_ID));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
		consoleSpy.mockRestore();
	});
});
