"use client";

import { ChevronDown, ChevronRight, Home } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { RoomStatusRow } from "./room-status-row";
import type { OverviewProperty } from "./types";

interface PropertyGroupProps {
	property: OverviewProperty;
}

export function PropertyGroup({ property }: PropertyGroupProps) {
	const t = useTranslations("app.overview");
	const locale = useLocale();
	const [isExpanded, setIsExpanded] = useState(true);

	const toggleExpand = () => setIsExpanded((prev) => !prev);

	const isFullyPaid = property.paidCount === property.rooms.length;

	const totalCollected = property.rooms.reduce(
		(sum, room) => sum + (room.payment?.status === "paid" ? room.total : 0),
		0,
	);

	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden">
			<button
				type="button"
				onClick={toggleExpand}
				aria-expanded={isExpanded}
				aria-label={
					isExpanded
						? t("collapseAria", { name: property.name })
						: t("expandAria", { name: property.name })
				}
				className="flex w-full items-center gap-3 px-4 py-3 text-left cursor-pointer bg-transparent border-0 transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				{isExpanded ? (
					<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
				)}
				<div
					className={cn(
						"flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
						isFullyPaid ? "bg-green-500/10" : "bg-amber-500/10",
					)}
				>
					<Home
						className={cn(
							"h-4 w-4",
							isFullyPaid ? "text-green-600" : "text-amber-600",
						)}
					/>
				</div>
				<span className="font-semibold text-sm text-foreground truncate">
					{property.name}
				</span>
				<span
					className={cn(
						"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
						isFullyPaid
							? "border-green-500/30 bg-green-500/10 text-green-600"
							: "border-amber-500/30 bg-amber-500/10 text-amber-600",
					)}
				>
					{t("paidCount", {
						paid: property.paidCount,
						total: property.rooms.length,
					})}
				</span>
				<div className="flex-1" />
				<div className="text-right shrink-0">
					<p className="text-sm font-semibold text-foreground">
						{formatCurrency(totalCollected, locale)}
					</p>
					<p className="text-xs text-muted-foreground">{t("collectedLabel")}</p>
				</div>
			</button>
			{isExpanded && (
				<div className="border-t border-border p-2 space-y-2">
					{property.rooms.map((room) => (
						<RoomStatusRow key={room.id} room={room} />
					))}
				</div>
			)}
		</div>
	);
}
