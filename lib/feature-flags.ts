export const FEATURES = {
	TENANT: "tenant",
} as const;

export type Feature = (typeof FEATURES)[keyof typeof FEATURES];

export function isFeatureEnabled(
	feature: Feature,
	values: readonly string[],
): boolean {
	return values
		.flatMap((value) => value.split(","))
		.map((value) => value.trim().toLowerCase())
		.includes(feature);
}
