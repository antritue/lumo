import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "@/lib/constants";

export const { Link, redirect, usePathname } = createNavigation({
	locales,
	defaultLocale,
});
