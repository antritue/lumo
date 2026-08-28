export const DATABASE_TABLES = {
	PROPERTIES: "properties",
	ROOMS: "rooms",
	RENT_PAYMENTS: "rent_payments",
	RENT_PAYMENT_CHARGES: "rent_payment_charges",
	PROPERTY_SERVICES: "property_services",
	ROOM_SERVICE_OVERRIDES: "room_service_overrides",
	USER_ENTITLEMENTS: "user_entitlements",
};

export const FREE_ROOM_LIMIT = 5;

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const locales = ["en", "vi"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
