import { defaultLocale, type Locale, locales } from "@/i18n";

const LOCALE_COOKIE = "app-locale";

export function getAppLocale(): Locale {
	if (typeof document === "undefined") return defaultLocale;

	const cookie = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${LOCALE_COOKIE}=`));
	const value = cookie?.split("=")[1] as Locale;

	if (value && locales.includes(value)) return value;

	// Fallback: browser preference
	const browserLang = navigator.language.slice(0, 2) as Locale;
	return locales.includes(browserLang) ? browserLang : defaultLocale;
}

export async function setAppLocale(locale: Locale) {
	await cookieStore.set({
		name: LOCALE_COOKIE,
		value: locale,
		path: "/app",
		expires: Date.now() + 31536000 * 1000, // 1 year in milliseconds
		sameSite: "lax",
	});
	window.location.reload();
}
