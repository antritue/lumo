import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const mockLimit = vi.fn();
const mockSelect = vi.fn();
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
		mockFrom.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ limit: mockLimit });
		mockLimit.mockResolvedValue({ error: null });
	});

	it("returns 401 when authorization header is missing", async () => {
		const req = new Request("http://localhost:3000/api/cron/health-check");
		const res = await GET(req);

		expect(res.status).toBe(401);
		const data = await res.json();
		expect(data.error).toBe("Unauthorized");
	});

	it("returns 401 when CRON_SECRET does not match", async () => {
		const req = new Request("http://localhost:3000/api/cron/health-check", {
			headers: { authorization: "Bearer wrong-secret" },
		});
		const res = await GET(req);

		expect(res.status).toBe(401);
	});

	it("returns 200 with status ok on successful ping", async () => {
		const req = new Request("http://localhost:3000/api/cron/health-check", {
			headers: { authorization: "Bearer test-secret" },
		});
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.status).toBe("ok");
		expect(data.timestamp).toBeDefined();
		expect(mockFrom).toHaveBeenCalledWith("properties");
		expect(mockSelect).toHaveBeenCalledWith("id");
		expect(mockLimit).toHaveBeenCalledWith(1);
	});

	it("returns 500 when database query fails", async () => {
		mockLimit.mockResolvedValue({ error: new Error("DB connection failed") });

		const req = new Request("http://localhost:3000/api/cron/health-check", {
			headers: { authorization: "Bearer test-secret" },
		});
		const res = await GET(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
