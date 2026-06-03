"use client";

import { Loader2, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type SubmitEvent, useState } from "react";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateRoomFormProps {
	onSubmit: (
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => Promise<void>;
	onCancel?: () => void;
	showCancel?: boolean;
}

export function CreateRoomForm({
	onSubmit,
	onCancel,
	showCancel = false,
}: CreateRoomFormProps) {
	const t = useTranslations("app.rooms");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	const [roomName, setRoomName] = useState("");
	const [monthlyRent, setMonthlyRent] = useState("");
	const [notes, setNotes] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const trimmedName = roomName.trim();

		if (!trimmedName) return;

		const rentValue = monthlyRent.trim()
			? Number.parseFloat(monthlyRent)
			: null;
		const notesValue = notes.trim() || null;

		setIsSubmitting(true);

		try {
			await onSubmit(trimmedName, rentValue, notesValue);
			setRoomName("");
			setMonthlyRent("");
			setNotes("");
		} catch {
			setErrorMessage(t("errors.create.description"));
			setErrorOpen(true);
			setIsSubmitting(false);
		}
	};

	if (isSubmitting) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2
					className="h-6 w-6 animate-spin text-muted-foreground"
					data-testid="room-create-loader"
				/>
			</div>
		);
	}

	return (
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

			<div className={showCancel ? "flex gap-3" : ""}>
				<Button
					type="submit"
					size="default"
					className={showCancel ? "flex-1" : "w-full"}
					disabled={!roomName.trim()}
				>
					<Plus className="mr-2" />
					{t("addButton")}
				</Button>
				{showCancel && onCancel && (
					<Button
						type="button"
						variant="outline"
						size="default"
						onClick={onCancel}
					>
						{t("cancel")}
					</Button>
				)}
			</div>
			<ErrorDialog
				open={errorOpen}
				onOpenChange={setErrorOpen}
				title={t("errors.create.title")}
				description={errorMessage}
			/>
		</form>
	);
}
