import { describe, expect, it } from "vitest";
import { FEATURES, isFeatureEnabled } from "./feature-flags";

describe("isFeatureEnabled", () => {
	it("returns false when no values are provided", () => {
		expect(isFeatureEnabled(FEATURES.TENANT, [])).toBe(false);
	});

	it("returns true for an enabled feature", () => {
		expect(isFeatureEnabled(FEATURES.TENANT, ["tenant"])).toBe(true);
	});

	it("parses comma-separated values", () => {
		expect(isFeatureEnabled(FEATURES.TENANT, ["tenant,unknown"])).toBe(true);
	});

	it("trims and lowercases values", () => {
		expect(isFeatureEnabled(FEATURES.TENANT, ["  TeNaNt  "])).toBe(true);
	});

	it("returns false when the feature is absent", () => {
		expect(isFeatureEnabled(FEATURES.TENANT, ["unknown", ""])).toBe(false);
	});
});
