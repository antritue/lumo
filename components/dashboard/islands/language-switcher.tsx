"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setAppLocale } from "@/lib/app-locale";
import { type Locale, locales } from "@/lib/constants";
import { cn } from "@/lib/utils";

const localeNames: Record<Locale, string> = { en: "EN", vi: "VI" };

export function LanguageSwitcher() {
	const currentLocale = useLocale() as Locale;
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const t = useTranslations("languageSwitcher");

	const handleLocaleChange = (newLocale: Locale) => {
		if (newLocale === currentLocale) return;

		startTransition(async () => {
			await setAppLocale(newLocale);
			router.refresh();
		});
	};

	return (
		<div
			className={cn(
				"flex items-center bg-secondary/50 rounded-full px-1 py-1 transition-opacity",
				isPending && "opacity-70 pointer-events-none",
			)}
		>
			<span className="sr-only">{t("label")}</span>
			{locales.map((locale) => (
				<button
					key={locale}
					type="button"
					onClick={() => handleLocaleChange(locale)}
					className={cn(
						"px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
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
