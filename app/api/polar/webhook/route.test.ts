import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleOrderPaid,
	handleOrderRefunded,
	handleSubscription,
} from "./route";

const mockUpsert = vi.fn();
const mockFrom = vi.fn();
const mockMaybeSingle = vi.fn();
const mockListSubscriptions = vi.fn();
const mockRevokeSubscription = vi.fn();

vi.mock("@polar-sh/nextjs", () => ({
	Webhooks: vi.fn(() => vi.fn()),
}));

vi.mock("@/lib/supabase-admin", () => ({
	createSupabaseAdminClient: vi.fn(() => ({
		from: mockFrom,
	})),
}));

vi.mock("@/lib/polar", () => ({
	tierFromProductId: (productId: string) => {
		if (productId === "prod-monthly") return "monthly";
		if (productId === "prod-yearly") return "yearly";
		if (productId === "prod-lifetime") return "lifetime";
		return null;
	},
	polar: {
		subscriptions: {
			list: (...args: Parameters<typeof mockListSubscriptions>) =>
				mockListSubscriptions(...args),
			revoke: (...args: Parameters<typeof mockRevokeSubscription>) =>
				mockRevokeSubscription(...args),
		},
	},
}));

const mockEntitlement = (
	overrides: { tier?: string | null; status?: string | null } = {},
) => ({
	tier: null,
	status: null,
	...overrides,
});

describe("webhook handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockMaybeSingle.mockResolvedValue({ data: mockEntitlement(), error: null });
		mockFrom.mockReturnValue({
			upsert: mockUpsert,
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					maybeSingle: mockMaybeSingle,
				}),
			}),
		});
		mockUpsert.mockResolvedValue({ error: null });
		mockListSubscriptions.mockResolvedValue({
			result: { items: [] },
		});
	});

	describe("handleSubscription", () => {
		const subscription = (overrides: Record<string, unknown> = {}) => ({
			id: "sub-1",
			customer: { id: "cust-1", externalId: "user-1" },
			productId: "prod-monthly",
			status: "active",
			currentPeriodEnd: new Date("2030-01-01T00:00:00Z"),
			...overrides,
		});

		it("upserts an active monthly entitlement", async () => {
			await handleSubscription(subscription());

			expect(mockFrom).toHaveBeenCalledWith("user_entitlements");
			expect(mockUpsert).toHaveBeenCalledWith(
				{
					user_id: "user-1",
					polar_customer_id: "cust-1",
					tier: "monthly",
					status: "active",
					current_period_end: "2030-01-01T00:00:00.000Z",
				},
				{ onConflict: "user_id" },
			);
		});

		it("upserts a yearly entitlement", async () => {
			await handleSubscription(subscription({ productId: "prod-yearly" }));

			expect(mockUpsert).toHaveBeenCalledWith(
				expect.objectContaining({ tier: "yearly" }),
				{ onConflict: "user_id" },
			);
		});

		it("does not upsert for a lifetime product subscription", async () => {
			await handleSubscription(subscription({ productId: "prod-lifetime" }));

			expect(mockUpsert).not.toHaveBeenCalled();
		});

		it("maps canceled to the canceled status", async () => {
			await handleSubscription(subscription({ status: "canceled" }));

			expect(mockUpsert).toHaveBeenCalledWith(
				expect.objectContaining({ status: "canceled" }),
				{ onConflict: "user_id" },
			);
		});

		it("maps paused to revoked", async () => {
			await handleSubscription(subscription({ status: "paused" }));

			expect(mockUpsert).toHaveBeenCalledWith(
				expect.objectContaining({ status: "revoked" }),
				{ onConflict: "user_id" },
			);
		});

		it("does not upsert when the customer has no external id", async () => {
			await handleSubscription(
				subscription({ customer: { id: "cust-1", externalId: null } }),
			);

			expect(mockUpsert).not.toHaveBeenCalled();
		});

		it("does not overwrite an active lifetime entitlement", async () => {
			mockMaybeSingle.mockResolvedValue({
				data: mockEntitlement({ tier: "lifetime", status: "active" }),
				error: null,
			});

			await handleSubscription(subscription());

			expect(mockUpsert).not.toHaveBeenCalled();
		});

		it("does overwrite a non-lifetime entitlement", async () => {
			mockMaybeSingle.mockResolvedValue({
				data: mockEntitlement({ tier: "yearly", status: "canceled" }),
				error: null,
			});

			await handleSubscription(subscription());

			expect(mockUpsert).toHaveBeenCalled();
		});

		it("does not upsert for an unknown product", async () => {
			await handleSubscription(subscription({ productId: "prod-unknown" }));

			expect(mockUpsert).not.toHaveBeenCalled();
		});

		it("rethrows on upsert error", async () => {
			mockUpsert.mockResolvedValue({ error: new Error("DB down") });

			await expect(handleSubscription(subscription())).rejects.toThrow(
				"DB down",
			);
		});
	});

	describe("handleOrderPaid", () => {
		const order = (overrides: Record<string, unknown> = {}) => ({
			id: "order-1",
			customer: { id: "cust-1", externalId: "user-1" },
			productId: "prod-lifetime",
			...overrides,
		});

		it("upserts an active lifetime entitlement", async () => {
			await handleOrderPaid(order());

			expect(mockUpsert).toHaveBeenCalledWith(
				{
					user_id: "user-1",
					polar_customer_id: "cust-1",
					tier: "lifetime",
					status: "active",
					current_period_end: null,
				},
				{ onConflict: "user_id" },
			);
		});

		it("does not grant lifetime for a recurring subscription order", async () => {
			await handleOrderPaid(order({ productId: "prod-monthly" }));

			expect(mockUpsert).not.toHaveBeenCalled();
		});

		it("does not grant lifetime when the customer has no external id", async () => {
			await handleOrderPaid(
				order({ customer: { id: "cust-1", externalId: null } }),
			);

			expect(mockUpsert).not.toHaveBeenCalled();
			expect(mockListSubscriptions).not.toHaveBeenCalled();
			expect(mockRevokeSubscription).not.toHaveBeenCalled();
		});

		it("immediately revokes active subscriptions after a lifetime purchase", async () => {
			mockListSubscriptions.mockResolvedValue({
				result: {
					items: [
						{ id: "sub-active", status: "active" },
						{ id: "sub-trialing", status: "trialing" },
					],
				},
			});

			await handleOrderPaid(order());

			expect(mockListSubscriptions).toHaveBeenCalledWith({
				customerId: "cust-1",
				status: ["active", "trialing"],
			});
			expect(mockRevokeSubscription).toHaveBeenCalledTimes(2);
			expect(mockRevokeSubscription).toHaveBeenCalledWith({
				id: "sub-active",
			});
			expect(mockRevokeSubscription).toHaveBeenCalledWith({
				id: "sub-trialing",
			});
		});

		it("still grants lifetime when subscription cancellation fails", async () => {
			mockListSubscriptions.mockRejectedValue(new Error("Polar scope"));
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await handleOrderPaid(order());

			expect(mockUpsert).toHaveBeenCalledWith(
				expect.objectContaining({ tier: "lifetime", status: "active" }),
				{ onConflict: "user_id" },
			);
			consoleSpy.mockRestore();
		});
	});

	describe("handleOrderRefunded", () => {
		it("revokes a lifetime entitlement", async () => {
			await handleOrderRefunded({
				id: "order-1",
				customer: { id: "cust-1", externalId: "user-1" },
				productId: "prod-lifetime",
			});

			expect(mockUpsert).toHaveBeenCalledWith(
				expect.objectContaining({ status: "revoked", tier: "lifetime" }),
				{ onConflict: "user_id" },
			);
		});

		it("ignores refunds for non-lifetime products", async () => {
			await handleOrderRefunded({
				id: "order-1",
				customer: { id: "cust-1", externalId: "user-1" },
				productId: "prod-yearly",
			});

			expect(mockUpsert).not.toHaveBeenCalled();
		});
	});

	describe("POST wiring", () => {
		beforeEach(() => {
			process.env.POLAR_WEBHOOK_SECRET = "test-secret";
		});

		it("registers the webhook secret and all six handlers", async () => {
			vi.resetModules();
			await import("./route");

			const { Webhooks } = await import("@polar-sh/nextjs");
			const config = vi.mocked(Webhooks).mock.calls.at(-1)?.[0];

			expect(config?.webhookSecret).toBe("test-secret");
			const handlerKeys = [
				"onOrderPaid",
				"onOrderRefunded",
				"onSubscriptionActive",
				"onSubscriptionUpdated",
				"onSubscriptionCanceled",
				"onSubscriptionRevoked",
			] as const;
			for (const handler of handlerKeys) {
				expect(typeof config?.[handler]).toBe("function");
			}
		});
	});
});
