import { Polar } from "@polar-sh/sdk";

const accessToken = process.env.POLAR_ACCESS_TOKEN;

if (!accessToken) {
	throw new Error("Polar access token is missing.");
}

const server =
	process.env.POLAR_SERVER === "production" ? "production" : "sandbox";

// Polar client for server-side use only — never exposed to the browser.
export const polar = new Polar({
	accessToken,
	server,
});

const POLAR_PRODUCT_IDS = {
	monthly: process.env.POLAR_PRODUCT_ID_MONTHLY,
	yearly: process.env.POLAR_PRODUCT_ID_YEARLY,
	lifetime: process.env.POLAR_PRODUCT_ID_LIFETIME,
} as const;

export type PolarTier = keyof typeof POLAR_PRODUCT_IDS;

export function tierFromProductId(productId: string): PolarTier | null {
	for (const [tier, id] of Object.entries(POLAR_PRODUCT_IDS)) {
		if (id === productId) {
			return tier as PolarTier;
		}
	}
	return null;
}
