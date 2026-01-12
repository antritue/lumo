"use client";

import { useEffect } from "react";

export function LangUpdater({ locale }: { locale: string }) {
	useEffect(() => {
		// Update the html lang attribute when locale changes during client-side navigation
		document.documentElement.lang = locale;
	}, [locale]);

	return null;
}
