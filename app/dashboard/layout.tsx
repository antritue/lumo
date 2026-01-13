import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/dashboard/app-shell";
import { getAppLocale } from "@/lib/app-locale";

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getAppLocale();
	const t = await getTranslations({ locale, namespace: "app.metadata" });

	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.lumo.homes";

	return {
		title: t("title"),
		description: t("description"),
		robots: {
			index: false,
			follow: false,
		},
		openGraph: {
			title: t("title"),
			description: t("description"),
			type: "website",
			locale: locale === "vi" ? "vi_VN" : "en_US",
			siteName: "Lumo",
			url: `${baseUrl}/dashboard`,
		},
	};
}

export default async function AppLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const locale = await getAppLocale();
	const messages = (await import(`@/messages/${locale}.json`)).default;

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<AppShell>{children}</AppShell>
		</NextIntlClientProvider>
	);
}
