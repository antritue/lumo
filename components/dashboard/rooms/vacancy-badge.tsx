"use client";

import { useTranslations } from "next-intl";

export function VacantBadge() {
	const t = useTranslations("app.rooms");

	return (
		<span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
			{t("vacant")}
		</span>
	);
}
