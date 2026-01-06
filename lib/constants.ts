export const DATABASE_TABLES = {
	WAITLIST: "waitlist",
};

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const locales = ["en", "vi"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
