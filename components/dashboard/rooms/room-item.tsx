"use client";

import { DoorOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "./types";

interface RoomItemProps {
	room: Room;
	onEdit?: (room: Room) => void;
	onDelete?: (room: Room) => void;
}

export function RoomItem({ room, onEdit, onDelete }: RoomItemProps) {
	const t = useTranslations("app.rooms");
	const locale = useLocale();

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onEdit?.(room);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onDelete?.(room);
	};

	return (
		<Link href={`/dashboard/rooms/${room.id}`} className="block">
			<div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background hover:bg-muted/90 transition-colors group">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 flex-shrink-0">
					<DoorOpen className="h-4 w-4 text-muted-foreground" />
				</div>
				<div className="flex-1 min-w-0">
					<p className="font-medium text-sm">{room.name}</p>
					{room.monthlyRent && (
						<p className="text-xs text-muted-foreground">
							{formatCurrency(room.monthlyRent, locale)}
						</p>
					)}
				</div>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleEdit}
						aria-label={t("edit")}
						className="h-8 w-8 hover:bg-accent"
					>
						<Pencil className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleDelete}
						aria-label={t("delete")}
						className="h-8 w-8 hover:bg-accent"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		</Link>
	);
}
