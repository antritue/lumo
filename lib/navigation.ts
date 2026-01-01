import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "@/i18n";

export const { Link, redirect, usePathname } = createNavigation({
	locales,
	defaultLocale,
});
