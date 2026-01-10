"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Room } from "./types";

interface EditRoomDialogProps {
	room: Room | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (id: string, name: string) => void;
}

export function EditRoomDialog({
	room,
	open,
	onOpenChange,
	onSave,
}: EditRoomDialogProps) {
	const t = useTranslations("app.rooms");
	const [roomName, setRoomName] = useState("");

	// Reset form when dialog opens with new room
	useEffect(() => {
		if (room) {
			setRoomName(room.name);
		}
	}, [room]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const trimmedName = roomName.trim();

		if (!trimmedName || !room) return;

		onSave(room.id, trimmedName);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("editTitle")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<Input
						type="text"
						value={roomName}
						onChange={(e) => setRoomName(e.target.value)}
						placeholder={t("inputPlaceholder")}
						className="text-base h-12"
						autoFocus
					/>
					<div className="flex gap-3">
						<Button
							type="submit"
							size="lg"
							className="flex-1"
							disabled={!roomName.trim()}
						>
							{t("saveButton")}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={() => onOpenChange(false)}
						>
							{t("cancel")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
