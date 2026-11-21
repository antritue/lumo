"use client";

import { Search, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { TenantTab } from "./types";

interface TenantFilterEmptyProps {
	hasQuery: boolean;
	tab: TenantTab;
	onClearSearch: () => void;
	onViewInactive: () => void;
}

export function TenantFilterEmpty({
	hasQuery,
	tab,
	onClearSearch,
	onViewInactive,
}: TenantFilterEmptyProps) {
	const t = useTranslations("app.tenants");

	return (
		<div className="flex flex-col items-center justify-center px-4 py-14 text-center">
			<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60">
				{hasQuery ? (
					<Search className="h-6 w-6 text-muted-foreground" />
				) : (
					<Users className="h-6 w-6 text-muted-foreground" />
				)}
			</div>
			<p className="mb-1 text-sm font-medium text-foreground">
				{hasQuery
					? t("noResultsTitle")
					: tab === "active"
						? t("emptyActiveTitle")
						: t("emptyInactiveTitle")}
			</p>
			<p className="mb-5 max-w-sm text-sm text-muted-foreground">
				{hasQuery
					? t("noResultsSubtitle")
					: tab === "active"
						? t("emptyActiveSubtitle")
						: t("emptyInactiveSubtitle")}
			</p>
			{hasQuery ? (
				<Button variant="outline" onClick={onClearSearch}>
					{t("clearSearch")}
				</Button>
			) : tab === "active" ? (
				<Button variant="outline" onClick={onViewInactive}>
					{t("viewInactive")}
				</Button>
			) : null}
		</div>
	);
}
