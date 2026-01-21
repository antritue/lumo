"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Room } from "./types";

interface DeleteRoomDialogProps {
	room: Room | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: (id: string) => void;
}

export function DeleteRoomDialog({
	room,
	open,
	onOpenChange,
	onDelete,
}: DeleteRoomDialogProps) {
	const t = useTranslations("app.rooms");

	const handleDelete = () => {
		if (!room) return;
		onDelete(room.id);
		onOpenChange(false);
	};

	if (!room) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-600" />
						{t("deleteTitle")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					<p className="text-sm text-muted-foreground leading-relaxed">
						{t("deleteMessage", { name: room.name })}
					</p>

					<div className="flex gap-3">
						<Button
							type="button"
							variant="destructive"
							size="lg"
							className="flex-1"
							onClick={handleDelete}
						>
							{t("deleteConfirm")}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="lg"
							className="flex-1"
							onClick={() => onOpenChange(false)}
							autoFocus
						>
							{t("cancel")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
