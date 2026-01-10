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
import { Textarea } from "@/components/ui/textarea";
import type { Room } from "./types";

interface EditRoomDialogProps {
	room: Room | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		id: string,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => void;
}

export function EditRoomDialog({
	room,
	open,
	onOpenChange,
	onSave,
}: EditRoomDialogProps) {
	const t = useTranslations("app.rooms");

	const [roomName, setRoomName] = useState("");
	const [monthlyRent, setMonthlyRent] = useState("");
	const [notes, setNotes] = useState("");

	// Reset form when dialog opens with new room
	useEffect(() => {
		if (room) {
			setRoomName(room.name);
			setMonthlyRent(room.monthlyRent ? String(room.monthlyRent) : "");
			setNotes(room.notes || "");
		}
	}, [room]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const trimmedName = roomName.trim();

		if (!trimmedName || !room) return;

		const rentValue = monthlyRent.trim()
			? Number.parseFloat(monthlyRent)
			: null;
		const notesValue = notes.trim() || null;

		onSave(room.id, trimmedName, rentValue, notesValue);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("editTitle")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Required Section */}
					<div className="space-y-4">
						<Input
							type="text"
							value={roomName}
							onChange={(e) => setRoomName(e.target.value)}
							placeholder={t("inputPlaceholder")}
							className="text-base h-12"
							autoFocus
							required
						/>
					</div>

					{/* Optional Section */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="h-px flex-1 bg-border" />
							<span className="text-sm text-muted-foreground">
								{t("optionalDetails")}
							</span>
							<div className="h-px flex-1 bg-border" />
						</div>

						<Input
							type="number"
							value={monthlyRent}
							onChange={(e) => setMonthlyRent(e.target.value)}
							placeholder={t("rentPlaceholder")}
							className="text-base h-12"
							min="0"
							step="0.01"
						/>

						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder={t("notesPlaceholder")}
							className="text-base min-h-[100px] resize-none"
							rows={4}
						/>
					</div>

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
