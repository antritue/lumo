import { beforeEach, describe, expect, it, vi } from "vitest";
import { listTenants } from "./route";

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			select: mockSelect,
		})),
	})),
}));

describe("GET /api/tenants", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for select -> eq
		mockSelect.mockReturnValue({ eq: mockEq });
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
