"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { RoomStatusRow } from "./room-status-row";
import type { OverviewProperty } from "./types";

interface PropertyGroupProps {
	property: OverviewProperty;
}

export function PropertyGroup({ property }: PropertyGroupProps) {
	const t = useTranslations("app.overview");
	const [isExpanded, setIsExpanded] = useState(true);

	const toggleExpand = () => setIsExpanded((prev) => !prev);

	return (
		<div className="rounded-xl border border-border bg-card">
			<button
				type="button"
				onClick={toggleExpand}
				aria-expanded={isExpanded}
				aria-label={
					isExpanded
						? t("collapseAria", { name: property.name })
						: t("expandAria", { name: property.name })
				}
				className="flex w-full items-center gap-2 px-4 py-3 text-left cursor-pointer bg-transparent border-0 rounded-xl transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
			>
				{isExpanded ? (
					<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
				)}
				<span className="font-semibold text-sm text-foreground truncate">
					{property.name}
				</span>
				<span className="text-xs text-muted-foreground shrink-0">
					{t("roomCount", { count: property.rooms.length })}
				</span>
				<div className="flex-1" />
				<span
					className={cn(
						"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0",
						property.paidCount === property.rooms.length
							? "border-green-500/30 bg-green-500/10 text-green-600"
							: "border-amber-500/30 bg-amber-500/10 text-amber-600",
					)}
				>
					{t("paidCount", {
						paid: property.paidCount,
						total: property.rooms.length,
					})}
				</span>
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
