import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CheckoutInput } from "@/lib/validations/checkout";
import { createCheckout } from "./route";

const mockGetUser = vi.fn();
const mockCreateCheckout = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
	})),
}));

vi.mock("@/lib/polar", () => ({
	polar: {
		checkouts: {
			create: (...args: Parameters<typeof mockCreateCheckout>) =>
				mockCreateCheckout(...args),
		},
	},
	getPolarProductId: (tier: string) => `prod-${tier}`,
}));

describe("POST /api/billing/checkout", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createRequest = (
		body: Partial<CheckoutInput> | Record<string, unknown>,
	) => {
		return new NextRequest("http://localhost:3000/api/billing/checkout", {
			method: "POST",
			body: JSON.stringify(body),
		});
	};

	const mockAuthenticatedUser = () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "test-user-id", email: "a@b.com" } },
			error: null,
		});
	};

	const mockUnauthenticated = () => {
		mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
	};

	it("returns 200 with a checkout url for a valid tier", async () => {
		mockAuthenticatedUser();
		mockCreateCheckout.mockResolvedValue({
			url: "https://checkout.polar.sh/x",
		});

		const req = createRequest({ tier: "monthly" });
		const res = await createCheckout(req);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({ url: "https://checkout.polar.sh/x" });
		expect(mockCreateCheckout).toHaveBeenCalledWith({
			products: ["prod-monthly"],
			externalCustomerId: "test-user-id",
			customerEmail: "a@b.com",
			successUrl: expect.stringContaining("/dashboard/settings?checkout="),
		});
	});

	it("returns 401 when the user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({ tier: "monthly" });
		const res = await createCheckout(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
		expect(mockCreateCheckout).not.toHaveBeenCalled();
	});

	it("returns 400 for an invalid tier", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ tier: "free" });
		const res = await createCheckout(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
		expect(mockCreateCheckout).not.toHaveBeenCalled();
	});

	it("returns 500 when polar checkout creation fails", async () => {
		mockAuthenticatedUser();
		mockCreateCheckout.mockRejectedValue(new Error("Polar down"));

		const req = createRequest({ tier: "yearly" });
		const res = await createCheckout(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
