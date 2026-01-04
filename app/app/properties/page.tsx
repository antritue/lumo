"use client";

import { Construction, Home } from "lucide-react";
import { useTranslations } from "next-intl";

export default function PropertiesPage() {
	const t = useTranslations("app.properties");

	return (
		<div className="max-w-4xl mx-auto py-12 px-4">
			{/* Development Warning Banner */}
			<div className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 p-6 flex items-start gap-4">
				<div className="p-2 bg-amber-100 rounded-lg">
					<Construction className="h-6 w-6 text-amber-700" />
				</div>
				<div>
					<div className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 mb-2">
						{t("devBadge")}
					</div>
					<h2 className="text-lg font-semibold text-amber-900 mb-1">
						Work in Progress
					</h2>
					<p className="text-amber-700 text-sm leading-relaxed">
						{t("inDevelopment")}
					</p>
				</div>
			</div>

			<div className="flex flex-col items-center justify-center py-24 bg-secondary/20 rounded-3xl border border-dashed border-border">
				<div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
					<Home className="h-8 w-8 text-muted-foreground" />
				</div>
				<h1 className="mt-6 text-xl font-semibold text-foreground">
					{t("emptyTitle")}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					{t("emptySubtitle")}
				</p>
			</div>
		</div>
	);
}
