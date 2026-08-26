"use client";

import {
	CircleCheck,
	CircleDashed,
	Clock,
	type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn, formatCurrency } from "@/lib/utils";
import type { OverviewSummary } from "./types";

type CardId = "collected" | "pending" | "not-recorded";

const cardStyles: Record<CardId, string> = {
	collected: "border-green-500/30 bg-green-500/10",
	pending: "border-amber-500/30 bg-amber-500/10",
	"not-recorded": "border-border bg-muted/40",
};

interface SummaryCardsProps {
	summary: OverviewSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
	const t = useTranslations("app.overview");
	const locale = useLocale();

	const cards: {
		id: CardId;
		icon: LucideIcon;
		iconClass: string;
		valueClass: string;
		label: string;
		value: string;
		subtitle: string | null;
	}[] = [
		{
			id: "collected",
			icon: CircleCheck,
			iconClass: "text-green-500",
			valueClass: "text-green-600",
			label: t("cardCollected"),
			value: formatCurrency(summary.collected, locale),
			subtitle: t("collectedSubtitle", {
				paid: summary.paidCount,
				total: summary.totalRooms,
			}),
		},
		{
			id: "pending",
			icon: Clock,
			iconClass: "text-amber-500",
			valueClass: "text-amber-600",
			label: t("cardPending"),
			value: formatCurrency(summary.pending, locale),
			subtitle: t("pendingSubtitle", { count: summary.pendingCount }),
		},
		{
			id: "not-recorded",
			icon: CircleDashed,
			iconClass: "text-muted-foreground",
			valueClass: "text-foreground",
			label: t("cardNotRecorded"),
			value: String(summary.notRecordedCount),
			subtitle: null,
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
			{cards.map((card) => (
				<div
					key={card.id}
					className={cn("rounded-xl border p-5", cardStyles[card.id])}
				>
					<div className="flex items-center justify-between gap-2">
						<p className="text-sm font-medium text-muted-foreground">
							{card.label}
						</p>
						<card.icon className={cn("h-4 w-4", card.iconClass)} />
					</div>
					<p
						className={cn(
							"mt-1 text-2xl font-semibold tracking-tight",
							card.valueClass,
						)}
					>
						{card.value}
					</p>
					{card.subtitle && (
						<p className="mt-1 text-sm text-muted-foreground">
							{card.subtitle}
						</p>
					)}
				</div>
			))}
		</div>
	);
}
