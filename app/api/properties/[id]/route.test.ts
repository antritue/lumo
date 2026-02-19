import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "./route";

// Mock the server client
const mockGetUser = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
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

describe("DELETE /api/properties/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for delete -> eq -> eq
		mockDelete.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
	});

	const createRequest = (id: string) => {
		return new NextRequest(`http://localhost/api/properties/${id}`, {
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

	it("should return 204 when authenticated user deletes their property", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 1,
		});

		const req = createRequest("prop-1");
		const res = await DELETE(req, createParams("prop-1"));

		expect(res.status).toBe(204);
		expect(mockDelete).toHaveBeenCalledWith({ count: "exact" });
		expect(mockEq).toHaveBeenCalledWith("id", "prop-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("prop-1");
		const res = await DELETE(req, createParams("prop-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when property is not found", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 0,
		});

		const req = createRequest("non-existent-id");
		const res = await DELETE(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Property not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("prop-1");
		const res = await DELETE(req, createParams("prop-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
