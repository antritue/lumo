export type BillingTier = "monthly" | "yearly" | "lifetime";

export interface BillingStatus {
	tier: BillingTier | null;
	isPaid: boolean;
	roomLimit: number | null;
	roomCount: number;
}
