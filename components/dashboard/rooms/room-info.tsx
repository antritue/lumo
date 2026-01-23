"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Room } from "./types";

interface RoomInfoProps {
	room: Room;
}

export function RoomInfo({ room }: RoomInfoProps) {
	const t = useTranslations("app.rooms");
	const locale = useLocale();
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	const hasInfo = room.monthlyRent || room.notes;

	if (!hasInfo) return null;

	return (
		<div>
			<button
				type="button"
				onClick={toggleExpanded}
				className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
				aria-expanded={isExpanded}
			>
				{isExpanded ? (
					<ChevronDown className="h-4 w-4" />
				) : (
					<ChevronRight className="h-4 w-4" />
				)}
				<span>{t("details.title")}</span>
			</button>

			{isExpanded && (
				<div className="mt-3 space-y-3 text-sm">
					{room.monthlyRent && (
						<div>
							<p className="text-muted-foreground mb-1">
								{t("details.monthlyRent")}
							</p>
							<p className="font-medium">
								{new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
									style: "currency",
									currency: locale === "vi" ? "VND" : "USD",
									minimumFractionDigits: 0,
								}).format(room.monthlyRent)}
							</p>
						</div>
					)}

					{room.notes && (
						<div>
							<p className="text-muted-foreground mb-1">{t("details.notes")}</p>
							<p className="leading-relaxed whitespace-pre-wrap">
								{room.notes}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
