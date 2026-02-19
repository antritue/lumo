import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PropertyInput } from "@/lib/validations/property";
import { DELETE, PATCH } from "./route";

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

	describe("PATCH /api/properties/:id", () => {
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
			body: PropertyInput | Record<string, unknown>,
		) => {
			return new NextRequest(`http://localhost/api/properties/${id}`, {
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

		it("should return 200 when authenticated user updates their property", async () => {
			mockAuthenticatedUser();
			const mockProperty = {
				id: "prop-1",
				name: "Updated House",
				user_id: "test-user-id",
			};
			mockSingle.mockResolvedValue({
				data: mockProperty,
				error: null,
			});

			const req = createRequest("prop-1", { name: "Updated House" });
			const res = await PATCH(req, createParams("prop-1"));
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data).toEqual(mockProperty);
			expect(mockUpdate).toHaveBeenCalledWith({ name: "Updated House" });
			expect(mockEq).toHaveBeenCalledWith("id", "prop-1");
			expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
		});

		it("should return 401 when user is not authenticated", async () => {
			mockUnauthenticated();

			const req = createRequest("prop-1", { name: "Updated House" });
			const res = await PATCH(req, createParams("prop-1"));
			const data = await res.json();

			expect(res.status).toBe(401);
			expect(data.error).toBe("Unauthorized");
		});

		it("should return 400 when name is missing", async () => {
			mockAuthenticatedUser();

			const req = createRequest("prop-1", {});
			const res = await PATCH(req, createParams("prop-1"));
			const data = await res.json();

			expect(res.status).toBe(400);
			expect(data.error).toBeDefined();
		});

		it("should return 404 when property is not found", async () => {
			mockAuthenticatedUser();
			mockSingle.mockResolvedValue({
				data: null,
				error: { code: "PGRST116", message: "No rows found" },
			});

			const req = createRequest("non-existent-id", { name: "Updated House" });
			const res = await PATCH(req, createParams("non-existent-id"));
			const data = await res.json();

			expect(res.status).toBe(404);
			expect(data.error).toBe("Property not found");
		});

		it("should return 500 when database error occurs", async () => {
			mockAuthenticatedUser();
			mockSingle.mockResolvedValue({
				data: null,
				error: { code: "some-error", message: "DB failure" },
			});

			const req = createRequest("prop-1", { name: "Updated House" });
			const res = await PATCH(req, createParams("prop-1"));
			const data = await res.json();

			expect(res.status).toBe(500);
			expect(data.error).toBe("Internal Server Error");
		});
	});
});
