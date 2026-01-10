"use client";

import { DoorOpen, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "./types";

interface RoomCardProps {
	room: Room;
	onEdit?: (room: Room) => void;
	onDelete?: (room: Room) => void;
}

export function RoomCard({ room, onEdit, onDelete }: RoomCardProps) {
	const t = useTranslations("app.rooms");

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
		<Card className="hover:shadow-soft-lg transition-shadow">
			<CardHeader>
				<div className="flex items-center justify-between gap-3">
					<CardTitle className="flex items-center gap-3 flex-1">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
							<DoorOpen className="h-5 w-5 text-muted-foreground" />
						</div>
						{room.name}
					</CardTitle>

					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleEdit}
							aria-label={t("edit")}
							className="h-9 w-9"
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleDelete}
							aria-label={t("delete")}
							className="h-9 w-9 text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
