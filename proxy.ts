import createMiddleware from "next-intl/middleware";
import { defaultLocale, LOCALE_COOKIE_NAME, locales } from "./lib/constants";

export default createMiddleware({
	// A list of all locales that are supported
	locales,

	// Used when no locale matches
	defaultLocale,

	// We want the locale to be prefixing the URL
	localePrefix: "always",

	// Explicitly configure cookie to sync with app routes
	localeCookie: {
		name: LOCALE_COOKIE_NAME,
	},
});

export const config = {
	// Match only internationalized pathnames
	matcher: ["/", "/(vi|en)/:path*"],
};
