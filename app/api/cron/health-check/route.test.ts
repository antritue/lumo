import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase-admin", () => ({
	createSupabaseAdminClient: vi.fn(() => ({
		from: mockFrom,
	})),
}));

describe("GET /api/cron/health-check", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("CRON_SECRET", "test-secret");
		mockFrom.mockReturnValue({ insert: mockInsert });
		mockInsert.mockResolvedValue({ error: null });
	});

	it("returns 401 when authorization header is missing", async () => {
		const req = new Request("http://localhost:3000/api/cron/health-check");
		const res = await GET(req);

		expect(res.status).toBe(401);
		const data = await res.json();
		expect(data.error).toBe("Unauthorized");
		expect(mockFrom).not.toHaveBeenCalled();
	});

	it("returns 401 when CRON_SECRET does not match", async () => {
		const req = new Request("http://localhost:3000/api/cron/health-check", {
			headers: { authorization: "Bearer wrong-secret" },
		});
		const res = await GET(req);

		expect(res.status).toBe(401);
		expect(mockFrom).not.toHaveBeenCalled();
	});

	it("returns 200 and records a heartbeat row on successful ping", async () => {
		const req = new Request("http://localhost:3000/api/cron/health-check", {
			headers: { authorization: "Bearer test-secret" },
		});
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.status).toBe("ok");
		expect(data.timestamp).toBeDefined();
		expect(mockFrom).toHaveBeenCalledWith("cron_pings");
		expect(mockInsert).toHaveBeenCalledWith({ source: "vercel-cron" });
	});

	it("returns 500 when the heartbeat insert fails", async () => {
		mockInsert.mockResolvedValue({ error: new Error("DB connection failed") });

		const req = new Request("http://localhost:3000/api/cron/health-check", {
			headers: { authorization: "Bearer test-secret" },
		});
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
