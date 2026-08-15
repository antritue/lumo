import { Webhooks } from "@polar-sh/nextjs";
import { SubscriptionStatus } from "@polar-sh/sdk/models/components/subscriptionstatus";
import { DATABASE_TABLES } from "@/lib/constants";
import type { EntitlementStatus, EntitlementTier } from "@/lib/entitlement";
import { polar, tierFromProductId } from "@/lib/polar";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

interface PolarCustomer {
	id: string;
	externalId?: string | null;
}

interface SubscriptionData {
	id: string;
	customer: PolarCustomer;
	productId: string;
	status: string;
	currentPeriodEnd: Date;
}

interface OrderData {
	id: string;
	customer: PolarCustomer;
	productId: string | null;
}

async function upsertEntitlement(params: {
	userId: string;
	polarCustomerId: string;
	tier: EntitlementTier;
	status: EntitlementStatus;
	currentPeriodEnd: string | null;
}) {
	const adminClient = createSupabaseAdminClient();
	const { error } = await adminClient
		.from(DATABASE_TABLES.USER_ENTITLEMENTS)
		.upsert(
			{
				user_id: params.userId,
				polar_customer_id: params.polarCustomerId,
				tier: params.tier,
				status: params.status,
				current_period_end: params.currentPeriodEnd,
			},
			{ onConflict: "user_id" },
		);

	if (error) {
		throw error;
	}
}

async function getEntitlement(userId: string): Promise<{
	tier: string | null;
	status: string | null;
} | null> {
	const adminClient = createSupabaseAdminClient();
	const { data, error } = await adminClient
		.from(DATABASE_TABLES.USER_ENTITLEMENTS)
		.select("tier, status")
		.eq("user_id", userId)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data ?? null;
}

/**
 * Cancel a customer's active subscriptions once a lifetime purchase lands.
 * Revokes immediately so no further recurring charge can be made
 * The lifetime entitlement is guarded so subscription events can't downgrade it.
 */
async function cancelActiveSubscriptions(polarCustomerId: string) {
	try {
		const subs = await polar.subscriptions.list({
			customerId: polarCustomerId,
			status: ["active", "trialing"],
		});

		await Promise.all(
			subs.result.items.map((sub) =>
				polar.subscriptions.revoke({ id: sub.id }),
			),
		);
	} catch (error) {
		console.error(
			"Failed to cancel subscriptions after lifetime purchase:",
			error,
		);
	}
}

export async function handleSubscription(subscription: SubscriptionData) {
	const userId = subscription.customer.externalId;
	if (!userId) {
		return;
	}

	const tier = tierFromProductId(subscription.productId);
	if (!tier || tier === "lifetime") {
		return;
	}

	// A lifetime entitlement is permanent: subscription events (renewals,
	// cancellations, etc.) must never downgrade it back to a recurring tier.
	const existing = await getEntitlement(userId);
	if (existing?.tier === "lifetime" && existing.status === "active") {
		return;
	}

	const status: EntitlementStatus =
		subscription.status === SubscriptionStatus.Canceled
			? "canceled"
			: subscription.status === SubscriptionStatus.Active ||
					subscription.status === SubscriptionStatus.Trialing
				? "active"
				: "revoked";

	await upsertEntitlement({
		userId,
		polarCustomerId: subscription.customer.id,
		tier,
		status,
		currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
	});
}

/**
 * Apply a lifetime entitlement from a one-time order. Returns whether the
 * entitlement was actually granted, so callers can react (e.g. cancel
 * recurring subscriptions) only when a lifetime purchase landed.
 */
async function applyLifetimeOrder(
	order: OrderData,
	status: EntitlementStatus,
): Promise<boolean> {
	const userId = order.customer.externalId;
	if (!userId) {
		return false;
	}

	// Only one-time (lifetime) orders grant an entitlement here;
	// subscription renewals are handled by handleSubscription.
	if (tierFromProductId(order.productId ?? "") !== "lifetime") {
		return false;
	}

	await upsertEntitlement({
		userId,
		polarCustomerId: order.customer.id,
		tier: "lifetime",
		status,
		currentPeriodEnd: null,
	});

	return true;
}

export async function handleOrderPaid(order: OrderData) {
	if (await applyLifetimeOrder(order, "active")) {
		// Stop recurring billing for any subscription the user still holds.
		await cancelActiveSubscriptions(order.customer.id);
	}
}

export async function handleOrderRefunded(order: OrderData) {
	await applyLifetimeOrder(order, "revoked");
}

export const POST = Webhooks({
	webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
	onOrderPaid: (payload) => handleOrderPaid(payload.data),
	onOrderRefunded: (payload) => handleOrderRefunded(payload.data),
	onSubscriptionActive: (payload) => handleSubscription(payload.data),
	onSubscriptionUpdated: (payload) => handleSubscription(payload.data),
	onSubscriptionCanceled: (payload) => handleSubscription(payload.data),
	onSubscriptionRevoked: (payload) => handleSubscription(payload.data),
});
