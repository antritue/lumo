"use client";

import { useTranslations } from "next-intl";
import { type Locale, locales } from "@/i18n";
import { getAppLocale, setAppLocale } from "@/lib/app-locale";
import { cn } from "@/lib/utils";

const localeNames: Record<Locale, string> = { en: "EN", vi: "VI" };

export function LanguageSwitcher() {
	const currentLocale = getAppLocale();
	const t = useTranslations("languageSwitcher");

	return (
		<div className="flex items-center bg-secondary/50 rounded-full px-1 py-1">
			<span className="sr-only">{t("label")}</span>
			{locales.map((locale) => (
				<button
					key={locale}
					type="button"
					onClick={() => setAppLocale(locale)}
					className={cn(
						"px-2 py-0.5 rounded-full text-[10px] font-bold transition-all",
						locale === currentLocale
							? "bg-white text-primary shadow-sm"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					{localeNames[locale]}
				</button>
			))}
		</div>
	);
}
