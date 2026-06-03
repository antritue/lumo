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

interface EditRoomDialogProps {
	room: Room | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		id: string,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => Promise<void>;
}

export function EditRoomDialog({
	room,
	open,
	onOpenChange,
	onSave,
}: EditRoomDialogProps) {
	const t = useTranslations("app.rooms");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	const [roomName, setRoomName] = useState("");
	const [monthlyRent, setMonthlyRent] = useState("");
	const [notes, setNotes] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Reset form when dialog opens with new room
	useEffect(() => {
		if (room) {
			setRoomName(room.name);
			setMonthlyRent(room.monthlyRent ? String(room.monthlyRent) : "");
			setNotes(room.notes || "");
			setIsSubmitting(false);
			setErrorOpen(false);
			setErrorMessage("");
		}
	}, [room]);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const trimmedName = roomName.trim();

		if (!trimmedName || !room) return;

		const rentValue = monthlyRent.trim()
			? Number.parseFloat(monthlyRent)
			: null;
		const notesValue = notes.trim() || null;

		setIsSubmitting(true);

		try {
			await onSave(room.id, trimmedName, rentValue, notesValue);
			onOpenChange(false);
		} catch {
			setErrorMessage(t("errors.update.description"));
			setErrorOpen(true);
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("editTitle")}</DialogTitle>
					<DialogDescription className="sr-only">
						{t("editTitle")}
					</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="room-edit-loader"
						/>
					</div>
				) : (
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
								{t("saveButton")}
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
					title={t("errors.update.title")}
					description={errorMessage}
				/>
			</DialogContent>
		</Dialog>
	);
}
