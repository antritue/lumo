import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n";

export default createMiddleware({
	// A list of all locales that are supported
	locales,

	// Used when no locale matches
	defaultLocale,

	// We want the locale to be prefixing the URL
	localePrefix: "always",
});

export const config = {
	// Match only internationalized pathnames
	matcher: ["/", "/(vi|en)/:path*"],
};
