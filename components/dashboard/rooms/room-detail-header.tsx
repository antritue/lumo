"use client";

import { ChevronRight, DoorOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Room } from "./types";

interface RoomDetailHeaderProps {
	room: Room;
	onEdit: () => void;
	onDelete: () => void;
}

export function RoomDetailHeader({
	room,
	onEdit,
	onDelete,
}: RoomDetailHeaderProps) {
	const t = useTranslations("app");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	return (
		<div className="space-y-6">
			<Link
				href="/dashboard/properties"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<ChevronRight className="h-4 w-4 rotate-180" />
				{t("properties.backToProperties")}
			</Link>

			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-4 min-w-0">
					<div className="flex items-center justify-center rounded-xl bg-secondary p-3 shrink-0">
						<DoorOpen className="h-6 w-6 text-muted-foreground" />
					</div>
					<div className="min-w-0">
						<h2 className="text-xl font-semibold truncate">{room.name}</h2>
						{room.monthlyRent && (
							<p className="text-sm text-muted-foreground mt-0.5">
								{new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
									style: "currency",
									currency,
									minimumFractionDigits: 0,
								}).format(room.monthlyRent)}
							</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1 shrink-0">
					<button
						type="button"
						onClick={onEdit}
						className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors cursor-pointer"
						aria-label={t("rooms.edit")}
					>
						<Pencil className="h-4 w-4 text-muted-foreground" />
					</button>
					<button
						type="button"
						onClick={onDelete}
						className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors cursor-pointer"
						aria-label={t("rooms.delete")}
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</button>
				</div>
			</div>
		</div>
	);
}
