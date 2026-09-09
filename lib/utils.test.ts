import { describe, expect, it } from "vitest";
import { formatServicePrice } from "./utils";

describe("formatServicePrice", () => {
	it("formats flat pricing with per-month suffix", () => {
		expect(
			formatServicePrice(
				{
					pricingType: "flat",
					flatAmount: 50,
					unitPrice: null,
					unitLabel: null,
				},
				"en",
				"/month",
				"unit",
			),
		).toBe("$50/month");
	});

	it("formats variable pricing with unit label", () => {
		expect(
			formatServicePrice(
				{
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 0.15,
					unitLabel: "kWh",
				},
				"en",
				"/month",
				"unit",
			),
		).toBe("$0.15/kWh");
	});

	it("falls back to default unit when unit label is missing", () => {
		expect(
			formatServicePrice(
				{
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 10,
					unitLabel: null,
				},
				"en",
				"/month",
				"unit",
			),
		).toBe("$10/unit");
	});

	it("returns empty string when price is not set", () => {
		expect(
			formatServicePrice(
				{
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
					unitLabel: null,
				},
				"en",
				"/month",
				"unit",
			),
		).toBe("");
	});

	it("formats with VND currency for Vietnamese locale", () => {
		const result = formatServicePrice(
			{
				pricingType: "flat",
				flatAmount: 100000,
				unitPrice: null,
				unitLabel: null,
			},
			"vi",
			"/tháng",
			"đơn vị",
		);

		expect(result).toContain("/tháng");
		expect(result).not.toContain("$");
	});
});
