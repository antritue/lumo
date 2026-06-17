"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type SubmitEvent, useEffect, useState } from "react";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Room } from "./types";

interface UpsertRoomDialogProps {
	mode: "add" | "edit";
	room?: Room;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		id: string | null,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => Promise<void>;
}

export function UpsertRoomDialog({
	mode,
	room,
	open,
	onOpenChange,
	onSave,
}: UpsertRoomDialogProps) {
	const t = useTranslations("app.rooms");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	const [roomName, setRoomName] = useState("");
	const [monthlyRent, setMonthlyRent] = useState("");
	const [notes, setNotes] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			setIsSubmitting(false);
			setErrorOpen(false);
			setErrorMessage("");
		}
		if (mode === "edit" && room) {
			setRoomName(room.name);
			setMonthlyRent(room.monthlyRent ? String(room.monthlyRent) : "");
			setNotes(room.notes || "");
		} else {
			setRoomName("");
			setMonthlyRent("");
			setNotes("");
		}
	}, [mode, room, open]);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const trimmedName = roomName.trim();
		if (!trimmedName) return;

		setIsSubmitting(true);

		try {
			const id = mode === "edit" && room ? room.id : null;
			const rentValue = monthlyRent.trim()
				? Number.parseFloat(monthlyRent)
				: null;
			const notesValue = notes.trim() || null;
			await onSave(id, trimmedName, rentValue, notesValue);
			onOpenChange(false);
		} catch {
			setErrorMessage(
				mode === "add"
					? t("errors.create.description")
					: t("errors.update.description"),
			);
			setErrorOpen(true);
			setIsSubmitting(false);
		}
	};

	const title = mode === "edit" ? t("editTitle") : t("addButton");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="sr-only">{title}</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="room-upsert-loader"
						/>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-6">
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

						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="h-px flex-1 bg-border" />
								<span className="text-sm text-muted-foreground">
									{t("optionalDetails")}
								</span>
								<div className="h-px flex-1 bg-border" />
							</div>

							<div className="relative">
								<Input
									type="number"
									value={monthlyRent}
									onChange={(e) => setMonthlyRent(e.target.value)}
									placeholder={t("rentPlaceholder")}
									className="text-base h-12 pr-16"
									min="0"
									step="0.01"
								/>
								<span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
									{currency}
								</span>
							</div>

							<Textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder={t("notesPlaceholder")}
								className="text-base min-h-25 resize-none"
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
								{mode === "edit" ? t("saveButton") : t("addButton")}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="flex-1"
								onClick={() => onOpenChange(false)}
							>
								{t("cancel")}
							</Button>
						</div>
					</form>
				)}

				<ErrorDialog
					open={errorOpen}
					onOpenChange={setErrorOpen}
					title={
						mode === "add" ? t("errors.create.title") : t("errors.update.title")
					}
					description={errorMessage}
				/>
			</DialogContent>
		</Dialog>
	);
}
