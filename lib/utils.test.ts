import { describe, expect, it } from "vitest";
import {
	formatAmountInputDisplay,
	formatCurrency,
	formatServicePrice,
	isValidEmail,
	parseAmountInputValue,
} from "./utils";

describe("formatCurrency", () => {
	it("always formats amounts in VND", () => {
		expect(formatCurrency(5_000_000)).toBe("₫5,000,000");
		expect(formatCurrency(0)).toBe("₫0");
	});
});

describe("formatServicePrice", () => {
	it("formats flat pricing with per-month suffix", () => {
		expect(
			formatServicePrice(
				{
					pricingType: "flat",
					flatAmount: 50_000,
					unitPrice: null,
					unitLabel: null,
				},
				"/month",
				"unit",
			),
		).toBe("₫50,000/month");
	});

	it("formats variable pricing with unit label", () => {
		expect(
			formatServicePrice(
				{
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 3_500,
					unitLabel: "kWh",
				},
				"/month",
				"unit",
			),
		).toBe("₫3,500/kWh");
	});

	it("falls back to default unit when unit label is missing", () => {
		expect(
			formatServicePrice(
				{
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 10_000,
					unitLabel: null,
				},
				"/month",
				"unit",
			),
		).toBe("₫10,000/unit");
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
				"/month",
				"unit",
			),
		).toBe("");
	});

	it("never formats prices in USD", () => {
		const result = formatServicePrice(
			{
				pricingType: "flat",
				flatAmount: 100_000,
				unitPrice: null,
				unitLabel: null,
			},
			"/tháng",
			"đơn vị",
		);

		expect(result).toBe("₫100,000/tháng");
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

describe("isValidEmail", () => {
	it("accepts simple addresses", () => {
		expect(isValidEmail("anh@example.com")).toBe(true);
	});

	it("rejects malformed or incomplete addresses", () => {
		expect(isValidEmail("not-an-email")).toBe(false);
		expect(isValidEmail("anh@example")).toBe(false);
		expect(isValidEmail("")).toBe(false);
	});
});
