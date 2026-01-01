"use client";

import { useLocale, useTranslations } from "next-intl";
import { type Locale, locales } from "@/i18n";
import { Link, usePathname } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const localeNames: Record<Locale, string> = {
	en: "EN",
	vi: "VI",
};

export function LanguageSwitcher() {
	const currentLocale = useLocale();
	const pathname = usePathname();
	const t = useTranslations("languageSwitcher");

	return (
		<div className="flex items-center bg-secondary/50 rounded-full px-1 py-1">
			<span className="sr-only">{t("label")}</span>
			{locales.map((locale) => (
				<Link
					key={locale}
					href={pathname}
					locale={locale}
					className={cn(
						"px-2 py-0.5 rounded-full text-[10px] font-bold transition-all",
						locale === currentLocale
							? "bg-white text-primary shadow-sm"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					{localeNames[locale]}
				</Link>
			))}
		</div>
	);
}
