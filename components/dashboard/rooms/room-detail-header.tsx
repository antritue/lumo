"use client";

import { ArrowLeft, DoorOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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

	return (
		<>
			<Button variant="ghost" asChild className="mb-4 -ml-3">
				<Link href="/dashboard/properties">
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("properties.backToProperties")}
				</Link>
			</Button>

			<div className="space-y-2">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
							<DoorOpen className="h-6 w-6 text-muted-foreground" />
						</div>
						<h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
							{room.name}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={onEdit}
							aria-label={t("rooms.edit")}
							className="h-9 w-9"
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={onDelete}
							aria-label={t("rooms.delete")}
							className="h-9 w-9 hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
