import type { Locale } from "./constants";

export interface PromoAssets {
	video: string;
	poster: string;
}

const PROMO_ASSETS: Record<Locale, PromoAssets> = {
	en: {
		video: "/promo.mp4",
		poster: "/promo-thumb.jpg",
	},
	vi: {
		video: "/promo-vi.mp4",
		poster: "/promo-vi-thumb.jpg",
	},
};

export function getPromoAssets(locale: string): PromoAssets {
	return PROMO_ASSETS[locale as Locale] ?? PROMO_ASSETS.en;
}
