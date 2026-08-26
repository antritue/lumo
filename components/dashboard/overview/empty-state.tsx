"use client";

import { ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";

export function OverviewEmptyState() {
	const t = useTranslations("app.overview");

	return (
		<div className="flex flex-col items-center justify-center py-16 sm:py-20">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50">
				<ClipboardList className="h-10 w-10 text-muted-foreground" />
			</div>
			<h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 text-center">
				{t("emptyTitle")}
			</h2>
			<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
				{t("emptySubtitle")}
			</p>
		</div>
	);
}
