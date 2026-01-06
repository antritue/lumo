"use server";

import { cookies } from "next/headers";
import {
	defaultLocale,
	LOCALE_COOKIE_NAME,
	type Locale,
	locales,
} from "@/lib/constants";

export async function getAppLocale(): Promise<Locale> {
	const cookieStore = await cookies();
	const cookie = cookieStore.get(LOCALE_COOKIE_NAME);
	const value = cookie?.value as Locale;

	if (value && locales.includes(value)) return value;

	return defaultLocale;
}

export async function setAppLocale(locale: Locale) {
	const cookieStore = await cookies();
	cookieStore.set(LOCALE_COOKIE_NAME, locale, {
		path: "/",
		maxAge: 31536000, // 1 year
		sameSite: "lax",
	});
}
