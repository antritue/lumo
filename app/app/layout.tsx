"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/app-shell";
import type { Locale } from "@/i18n";
import { getAppLocale } from "@/lib/app-locale";

export default function AppLayout({ children }: { children: React.ReactNode }) {
	const [locale, setLocale] = useState<Locale | null>(null);
	const [messages, setMessages] = useState<Record<string, unknown> | null>(
		null,
	);

	useEffect(() => {
		const currentLocale = getAppLocale();
		setLocale(currentLocale);
		import(`@/messages/${currentLocale}.json`).then((mod) => {
			setMessages(mod.default);
		});
	}, []);

	// Loading state
	if (!locale || !messages) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-pulse text-muted-foreground">Loading...</div>
			</div>
		);
	}

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<AppShell>{children}</AppShell>
		</NextIntlClientProvider>
	);
}
