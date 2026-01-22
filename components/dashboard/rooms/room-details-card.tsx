"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "./types";

interface RoomDetailsCardProps {
	room: Room;
}

export function RoomDetailsCard({ room }: RoomDetailsCardProps) {
	const t = useTranslations("app.rooms.details");
	const locale = useLocale();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">{t("title")}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{room.monthlyRent && (
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">{t("monthlyRent")}</p>
						<p className="text-xl font-semibold">
							{new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
								style: "currency",
								currency: locale === "vi" ? "VND" : "USD",
								minimumFractionDigits: 0,
							}).format(room.monthlyRent)}
						</p>
					</div>
				)}

				{room.notes && (
					<div className="space-y-2 pt-2">
						<p className="text-sm text-muted-foreground">{t("notes")}</p>
						<p className="text-sm leading-relaxed whitespace-pre-wrap">
							{room.notes}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
