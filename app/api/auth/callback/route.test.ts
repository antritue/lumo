import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { GET } from "./route";

vi.mock("@/lib/supabase", () => ({
	supabase: {
		auth: {
			exchangeCodeForSession: vi.fn(),
		},
	},
}));

describe("GET /api/auth/callback", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createRequest = (url: string) => {
		return new NextRequest(url, {
			method: "GET",
		});
	};

	it("should exchange code for session and redirect to dashboard when code is present", async () => {
		const code = "test-auth-code";
		const mockExchange = vi.fn().mockResolvedValue({ data: {}, error: null });
		vi.mocked(supabase.auth.exchangeCodeForSession).mockImplementation(
			mockExchange,
		);

		const req = createRequest(
			`http://localhost/api/auth/callback?code=${code}`,
		);
		const res = await GET(req);

		expect(mockExchange).toHaveBeenCalledWith(code);
		expect(res.status).toBe(307); // NextResponse.redirect uses 307 Temporary Redirect by default
		expect(res.headers.get("location")).toBe("http://localhost/dashboard");
	});

	it("should skip exchange and redirect to dashboard when code is missing", async () => {
		const mockExchange = vi.fn();
		vi.mocked(supabase.auth.exchangeCodeForSession).mockImplementation(
			mockExchange,
		);

		const req = createRequest("http://localhost/api/auth/callback");
		const res = await GET(req);

		expect(mockExchange).not.toHaveBeenCalled();
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toBe("http://localhost/dashboard");
	});
});
