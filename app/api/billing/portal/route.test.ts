import { ResourceNotFound } from "@polar-sh/sdk/models/errors/resourcenotfound";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCustomerPortal } from "./route";

const notFound = () =>
	new ResourceNotFound(
		{ error: "ResourceNotFound", detail: "Customer does not exist" },
		{
			request: new Request("http://localhost"),
			response: new Response(),
			body: "{}",
		},
	);

const mockGetUser = vi.fn();
const mockGetExternal = vi.fn();
const mockListCustomers = vi.fn();
const mockCreateCustomerSession = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
	})),
}));

vi.mock("@/lib/polar", () => ({
	polar: {
		customers: {
			getExternal: (...args: Parameters<typeof mockGetExternal>) =>
				mockGetExternal(...args),
			list: (...args: Parameters<typeof mockListCustomers>) =>
				mockListCustomers(...args),
		},
		customerSessions: {
			create: (...args: Parameters<typeof mockCreateCustomerSession>) =>
				mockCreateCustomerSession(...args),
		},
	},
}));

describe("GET /api/billing/portal", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.NEXT_PUBLIC_APP_URL;
	});

	const createRequest = () => {
		return new NextRequest("http://localhost:3000/api/billing/portal", {
			method: "GET",
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

	it("resolves the customer by external id and returns the portal url", async () => {
		mockAuthenticatedUser();
		mockGetExternal.mockResolvedValue({ id: "cust-1" });
		mockCreateCustomerSession.mockResolvedValue({
			customerPortalUrl: "https://sandbox.polar.sh/lumotest/portal?token=x",
		});

		const res = await createCustomerPortal(createRequest());
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			url: "https://sandbox.polar.sh/lumotest/portal?token=x",
		});
		expect(mockGetExternal).toHaveBeenCalledWith({
			externalId: "test-user-id",
		});
		expect(mockListCustomers).not.toHaveBeenCalled();
		expect(mockCreateCustomerSession).toHaveBeenCalledWith({
			customerId: "cust-1",
			returnUrl: "http://localhost:3000/dashboard/settings",
		});
	});

	it("falls back to the email lookup when the customer has no external id", async () => {
		mockAuthenticatedUser();
		mockGetExternal.mockRejectedValue(notFound());
		mockListCustomers.mockResolvedValue({
			result: { items: [{ id: "cust-by-email" }] },
		});
		mockCreateCustomerSession.mockResolvedValue({
			customerPortalUrl: "https://sandbox.polar.sh/lumotest/portal?token=x",
		});

		const res = await createCustomerPortal(createRequest());
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			url: "https://sandbox.polar.sh/lumotest/portal?token=x",
		});
		expect(mockListCustomers).toHaveBeenCalledWith({
			email: "a@b.com",
			limit: 1,
		});
		expect(mockCreateCustomerSession).toHaveBeenCalledWith({
			customerId: "cust-by-email",
			returnUrl: "http://localhost:3000/dashboard/settings",
		});
	});

	it("returns 404 when no customer can be resolved", async () => {
		mockAuthenticatedUser();
		mockGetExternal.mockRejectedValue(notFound());
		mockListCustomers.mockResolvedValue({
			result: { items: [] },
		});

		const res = await createCustomerPortal(createRequest());
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("No Polar customer found for this account");
		expect(mockCreateCustomerSession).not.toHaveBeenCalled();
	});

	it("uses NEXT_PUBLIC_APP_URL as the return url base when set", async () => {
		process.env.NEXT_PUBLIC_APP_URL = "https://lumo.example.com";
		mockAuthenticatedUser();
		mockGetExternal.mockResolvedValue({ id: "cust-1" });
		mockCreateCustomerSession.mockResolvedValue({
			customerPortalUrl: "https://sandbox.polar.sh/lumotest/portal?token=x",
		});

		const res = await createCustomerPortal(createRequest());

		expect(mockCreateCustomerSession).toHaveBeenCalledWith({
			customerId: "cust-1",
			returnUrl: "https://lumo.example.com/dashboard/settings",
		});
		expect(res.status).toBe(200);
	});

	it("returns 401 when the user is not authenticated", async () => {
		mockUnauthenticated();

		const res = await createCustomerPortal(createRequest());
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
		expect(mockGetExternal).not.toHaveBeenCalled();
		expect(mockCreateCustomerSession).not.toHaveBeenCalled();
	});

	it("returns 500 when polar session creation fails", async () => {
		mockAuthenticatedUser();
		mockGetExternal.mockResolvedValue({ id: "cust-1" });
		mockCreateCustomerSession.mockRejectedValue(new Error("Polar down"));
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const res = await createCustomerPortal(createRequest());
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
		consoleSpy.mockRestore();
	});
});
