"use client";

import { Plus, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TenantTab } from "./types";

const TABS: {
	value: TenantTab;
	labelKey: "tabActive" | "tabInactive" | "tabAll";
}[] = [
	{ value: "active", labelKey: "tabActive" },
	{ value: "inactive", labelKey: "tabInactive" },
	{ value: "all", labelKey: "tabAll" },
];

interface TenantToolbarProps {
	tab: TenantTab;
	counts: Record<TenantTab, number>;
	query: string;
	onTabChange: (tab: TenantTab) => void;
	onQueryChange: (query: string) => void;
	onAdd: () => void;
}

export function TenantToolbar({
	tab,
	counts,
	query,
	onTabChange,
	onQueryChange,
	onAdd,
}: TenantToolbarProps) {
	const t = useTranslations("app.tenants");
	const hasQuery = query.trim().length > 0;

	return (
		<div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
			<fieldset
				aria-label={t("filterLabel")}
				className="flex w-full rounded-full bg-secondary p-1 sm:w-auto"
			>
				{TABS.map((item) => (
					<button
						key={item.value}
						type="button"
						onClick={() => onTabChange(item.value)}
						aria-pressed={tab === item.value}
						className={
							tab === item.value
								? "flex flex-1 items-center justify-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-sm font-medium text-foreground shadow-soft transition-colors sm:flex-none"
								: "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex-none"
						}
					>
						{t(item.labelKey)}
						<span className="text-xs text-muted-foreground">
							{counts[item.value]}
						</span>
					</button>
				))}
			</fieldset>

			<div className="flex w-full items-center gap-2 sm:w-auto">
				<div className="relative min-w-0 flex-1 sm:flex-none sm:w-64">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(event) => onQueryChange(event.target.value)}
						placeholder={t("searchPlaceholder")}
						aria-label={t("searchPlaceholder")}
						className="h-9 pl-9 pr-9 text-sm rounded-full bg-card border-border"
					/>
					{hasQuery && (
						<button
							type="button"
							onClick={() => onQueryChange("")}
							aria-label={t("clearSearch")}
							className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
				</div>
				<Button
					onClick={onAdd}
					size="icon"
					aria-label={t("addButton")}
					className="h-9 w-9 shrink-0"
				>
					<Plus />
				</Button>
			</div>
		</div>
	);
}
