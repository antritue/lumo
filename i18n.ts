import { getRequestConfig } from "next-intl/server";
import { getAppLocale } from "@/lib/app-locale";
import { type Locale, locales } from "@/lib/constants";

export default getRequestConfig(async ({ requestLocale }) => {
	let locale = await requestLocale;

	if (!locale || !locales.includes(locale as Locale)) {
		// Fallback for non-localized routes (like /dashboard)
		locale = await getAppLocale();
	}

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default,
	};
});
