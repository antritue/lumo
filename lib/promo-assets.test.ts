import { describe, expect, it } from "vitest";
import { getPromoAssets } from "./promo-assets";

describe("getPromoAssets", () => {
	it("returns English promo assets for en", () => {
		expect(getPromoAssets("en")).toEqual({
			video: "/promo.mp4",
			poster: "/promo-thumb.jpg",
		});
	});

	it("returns Vietnamese promo assets for vi", () => {
		expect(getPromoAssets("vi")).toEqual({
			video: "/promo-vi.mp4",
			poster: "/promo-vi-thumb.jpg",
		});
	});

	it("falls back to English for unknown locales", () => {
		expect(getPromoAssets("fr")).toEqual({
			video: "/promo.mp4",
			poster: "/promo-thumb.jpg",
		});
	});
});
