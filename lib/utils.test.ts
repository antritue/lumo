import { describe, expect, it } from "vitest";
import {
	formatAmountInputDisplay,
	formatServicePrice,
	parseAmountInputValue,
} from "./utils";

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

describe("formatAmountInputDisplay", () => {
	it("returns empty string for empty input", () => {
		expect(formatAmountInputDisplay("")).toBe("");
	});

	it("formats thousands with commas", () => {
		expect(formatAmountInputDisplay("5000")).toBe("5,000");
		expect(formatAmountInputDisplay("5000000")).toBe("5,000,000");
	});

	it("keeps decimals with dot separator", () => {
		expect(formatAmountInputDisplay("5000.5")).toBe("5,000.5");
		expect(formatAmountInputDisplay("0.15")).toBe("0.15");
	});

	it("is idempotent for already formatted values", () => {
		expect(formatAmountInputDisplay("5,000,000")).toBe("5,000,000");
	});
});

describe("parseAmountInputValue", () => {
	it("strips commas", () => {
		expect(parseAmountInputValue("5,000,000")).toBe("5000000");
		expect(parseAmountInputValue("5,000.5")).toBe("5000.5");
	});

	it("returns empty string for empty input", () => {
		expect(parseAmountInputValue("")).toBe("");
	});

	it("rejects negative sign", () => {
		expect(parseAmountInputValue("-100")).toBe("100");
	});

	it("limits decimals to two digits", () => {
		expect(parseAmountInputValue("5000.123")).toBe("5000.12");
		expect(parseAmountInputValue("5,000.129")).toBe("5000.12");
	});
});
