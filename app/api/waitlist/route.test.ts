import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WaitlistInput } from "@/lib/validations/waitlist";
import { POST } from "./route";

// Mock the server client
const mockInsert = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() =>
		Promise.resolve({
			from: vi.fn(() => ({
				insert: mockInsert,
			})),
		}),
	),
}));

describe("POST /api/waitlist", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createRequest = (body: WaitlistInput) => {
		return new NextRequest("http://localhost/api/waitlist", {
			method: "POST",
			body: JSON.stringify(body),
		});
	};

	it("should return 201 when valid email is submitted", async () => {
		mockInsert.mockResolvedValue({ error: null });

		const req = createRequest({ email: "test@example.com" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.message).toBe("Successfully joined the waitlist!");
		expect(mockInsert).toHaveBeenCalledWith([{ email: "test@example.com" }]);
	});

	it("should return 400 when email is invalid", async () => {
		const req = createRequest({ email: "not-an-email" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 200 when email already exists (Postgres 23505)", async () => {
		mockInsert.mockResolvedValue({
			error: { code: "23505" },
		});

		const req = createRequest({ email: "duplicate@example.com" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.message).toBe("You're already on the waitlist!");
	});

	it("should return 500 when database error occurs", async () => {
		mockInsert.mockResolvedValue({
			error: { code: "some-other-error", message: "DB failure" },
		});

		const req = createRequest({ email: "error@example.com" });
		const res = await POST(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
