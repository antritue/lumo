import type { SupabaseClient } from "@supabase/supabase-js";
import { DATABASE_TABLES, FREE_ROOM_LIMIT } from "@/lib/constants";
import { mapToCamelCase } from "@/lib/utils";

export type EntitlementTier = "monthly" | "yearly" | "lifetime";

// EntitlementStatus (kept in sync by the Polar webhook):
// - active: currently paid (subscription in force, or lifetime order fulfilled)
// - canceled: subscription canceled in Polar, but access continues until current_period_end
// - revoked: access lost immediately (refund/chargeback/admin), regardless of billing period
export type EntitlementStatus = "active" | "canceled" | "revoked";

export interface UserEntitlement {
	id: string;
	userId: string;
	polarCustomerId: string | null;
	tier: EntitlementTier;
	status: EntitlementStatus;
	currentPeriodEnd: string | null;
}

/**
 * Fetch the current user's entitlement row (null when free).
 */
export async function getUserEntitlement(
	userId: string,
	supabase: SupabaseClient,
): Promise<UserEntitlement | null> {
	const { data, error } = await supabase
		.from(DATABASE_TABLES.USER_ENTITLEMENTS)
		.select("*")
		.eq("user_id", userId)
		.maybeSingle();

	if (error || !data) {
		return null;
	}

	return mapToCamelCase(data) as UserEntitlement;
}

/**
 * Whether an entitlement currently grants unlimited rooms.
 * - lifetime + active → always paid
 * - monthly/yearly → paid while not revoked and the billing period is still in force
 */
export function isPaid(entitlement: UserEntitlement | null): boolean {
	if (!entitlement) {
		return false;
	}

	if (entitlement.tier === "lifetime") {
		return entitlement.status === "active";
	}

	if (entitlement.status === "revoked") {
		return false;
	}

	return (
		entitlement.currentPeriodEnd !== null &&
		new Date(entitlement.currentPeriodEnd) > new Date()
	);
}

/**
 * Room limit for an entitlement: null (unlimited) when paid, FREE_ROOM_LIMIT otherwise.
 */
export function getRoomLimit(
	entitlement: UserEntitlement | null,
): number | null {
	return isPaid(entitlement) ? null : FREE_ROOM_LIMIT;
}
