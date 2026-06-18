"use client";

import { useTranslations } from "next-intl";
import type { Room } from "./types";

interface RoomInfoProps {
	room: Room;
}

export function RoomInfo({ room }: RoomInfoProps) {
	const t = useTranslations("app.rooms");

	if (!room.notes) return null;

	return (
		<div className="space-y-2">
			<p className="text-sm font-medium text-foreground">
				{t("details.notes")}
			</p>
			<p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
				{room.notes}
			</p>
		</div>
	);
}
