import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { type Locale, locales } from "@/i18n";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = (await params) as { locale: Locale };
	const t = await getTranslations({ locale, namespace: "metadata" });

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.lumo.homes";

	return {
		title: t("title"),
		description: t("description"),
		keywords: t("keywords")
			.split(",")
			.map((k) => k.trim()),
		alternates: {
			canonical: `${baseUrl}/${locale}`,
			languages: {
				en: `${baseUrl}/en`,
				vi: `${baseUrl}/vi`,
				"x-default": `${baseUrl}/en`,
			},
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			type: "website",
			locale: locale === "vi" ? "vi_VN" : "en_US",
			siteName: "Lumo",
			url: `${baseUrl}/${locale}`,
		},
		twitter: {
			card: "summary_large_image",
			title: t("title"),
			description: t("description"),
		},
	};
}

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = (await params) as { locale: Locale };

	if (!locales.includes(locale)) {
		notFound();
	}

	const messages = await getMessages();

	return (
		<NextIntlClientProvider messages={messages}>
			{children}
		</NextIntlClientProvider>
	);
}
