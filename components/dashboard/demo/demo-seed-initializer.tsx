"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { Locale } from "@/lib/constants";
import { seedDemoStoresIfEmpty } from "@/lib/demo-seed";

/**
 * Seeds guest demo data for all dashboard pages and renders nothing.
 * Mounted before the page in the dashboard layout so this effect runs first.
 */
export function DemoSeedInitializer() {
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);
	const locale = useLocale() as Locale;

	useEffect(() => {
		if (!authLoading && !user) {
			seedDemoStoresIfEmpty(locale);
		}
	}, [user, authLoading, locale]);

	return null;
}
