import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

// Mock the server client
const mockExchangeCodeForSession = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() =>
		Promise.resolve({
			auth: {
				exchangeCodeForSession: mockExchangeCodeForSession,
			},
		}),
	),
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
		mockExchangeCodeForSession.mockResolvedValue({ data: {}, error: null });

		const req = createRequest(
			`http://localhost/api/auth/callback?code=${code}`,
		);
		const res = await GET(req);

		expect(mockExchangeCodeForSession).toHaveBeenCalledWith(code);
		expect(res.status).toBe(307); // NextResponse.redirect uses 307 Temporary Redirect by default
		expect(res.headers.get("location")).toBe("http://localhost/dashboard");
	});

	it("should skip exchange and redirect to dashboard when code is missing", async () => {
		const req = createRequest("http://localhost/api/auth/callback");
		const res = await GET(req);

		expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
		expect(res.status).toBe(307);
		expect(res.headers.get("location")).toBe("http://localhost/dashboard");
	});
});
