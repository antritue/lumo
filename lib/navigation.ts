import { createNavigation } from "next-intl/navigation";
import { defaultLocale, locales } from "@/lib/constants";

export const { Link, usePathname } = createNavigation({
	locales,
	defaultLocale,
});
