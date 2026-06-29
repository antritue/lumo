export const DATABASE_TABLES = {
	WAITLIST: "waitlist",
	PROPERTIES: "properties",
	ROOMS: "rooms",
	RENT_PAYMENTS: "rent_payments",
	RENT_PAYMENT_CHARGES: "rent_payment_charges",
	SERVICES: "services",
	PROPERTY_SERVICES: "property_services",
	ROOM_SERVICES: "room_services",
};

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const locales = ["en", "vi"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
