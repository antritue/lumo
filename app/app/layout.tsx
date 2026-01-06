import { NextIntlClientProvider } from "next-intl";
import { AppShell } from "@/components/app/app-shell";
import { getAppLocale } from "@/lib/app-locale";

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
