"use client";

import { Construction } from "lucide-react";
import { useTranslations } from "next-intl";

interface DevelopmentBannerProps {
	namespace?: string;
}

export function DevelopmentBanner({
	namespace = "app.properties",
}: DevelopmentBannerProps) {
	const t = useTranslations(namespace);

	return (
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
	);
}
