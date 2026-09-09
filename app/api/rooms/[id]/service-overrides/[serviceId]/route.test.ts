import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteRoomServiceOverride } from "./route";

const ROOM_ID = "room-id";
const USER_ID = "user-id";
const SVC_1_ID = "svc-id-1";
const mockGetUser = vi.fn();
const mockDelete = vi.fn();
const mockEq1 = vi.fn();
const mockEq2 = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			delete: mockDelete,
		})),
	})),
}));

describe("DELETE /api/rooms/[id]/service-overrides/[serviceId]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDelete.mockReturnValue({ eq: mockEq1 });
		mockEq1.mockReturnValue({ eq: mockEq2 });
	});

	const createRequest = () => {
		return new NextRequest(
			`http://localhost:3000/api/rooms/${ROOM_ID}/service-overrides/${SVC_1_ID}`,
			{ method: "DELETE" },
		);
	};

	const createParams = (id: string, serviceId: string) => ({
		params: Promise.resolve({ id, serviceId }),
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

	it("should return 204 when override is deleted", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 1,
		});

		const req = createRequest();
		const res = await deleteRoomServiceOverride(
			req,
			createParams(ROOM_ID, SVC_1_ID),
		);

		expect(res.status).toBe(204);
		expect(mockDelete).toHaveBeenCalledWith({ count: "exact" });
		expect(mockEq1).toHaveBeenCalledWith("room_id", ROOM_ID);
		expect(mockEq2).toHaveBeenCalledWith("service_id", SVC_1_ID);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest();
		const res = await deleteRoomServiceOverride(
			req,
			createParams(ROOM_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when override is not found", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 0,
		});

		const req = createRequest();
		const res = await deleteRoomServiceOverride(
			req,
			createParams(ROOM_ID, "00000000-0000-4000-8000-ffffffffffff"),
		);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Room service override not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest();
		const res = await deleteRoomServiceOverride(
			req,
			createParams(ROOM_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
