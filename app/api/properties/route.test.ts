import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PropertyInput } from "@/lib/validations/property";
import { POST } from "./route";

// Mock the server client
const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			insert: mockInsert,
		})),
	})),
}));

describe("POST /api/properties", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for insert -> select -> single
		mockInsert.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ single: mockSingle });
	});

	const createRequest = (body: PropertyInput | Record<string, unknown>) => {
		return new NextRequest("http://localhost/api/properties", {
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

	it("should return 201 when authenticated user creates a property", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: { id: "new-prop-id", name: "My House", user_id: "test-user-id" },
			error: null,
		});

		const req = createRequest({ name: "My House" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.name).toBe("My House");
		expect(mockInsert).toHaveBeenCalledWith([
			{ name: "My House", user_id: "test-user-id" },
		]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({ name: "My House" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when name is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({});
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest({ name: "My House" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
