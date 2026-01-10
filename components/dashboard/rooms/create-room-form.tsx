"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateRoomFormProps {
	onSubmit: (
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => void;
	onCancel?: () => void;
	showCancel?: boolean;
}

export function CreateRoomForm({
	onSubmit,
	onCancel,
	showCancel = false,
}: CreateRoomFormProps) {
	const t = useTranslations("app.rooms");

	const [roomName, setRoomName] = useState("");
	const [monthlyRent, setMonthlyRent] = useState("");
	const [notes, setNotes] = useState("");

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const trimmedName = roomName.trim();

		if (!trimmedName) return;

		const rentValue = monthlyRent.trim()
			? Number.parseFloat(monthlyRent)
			: null;
		const notesValue = notes.trim() || null;

		onSubmit(trimmedName, rentValue, notesValue);
		setRoomName("");
		setMonthlyRent("");
		setNotes("");
	};

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

			<div className={showCancel ? "flex gap-3" : ""}>
				<Button
					type="submit"
					size="lg"
					className={showCancel ? "flex-1" : "w-full"}
					disabled={!roomName.trim()}
				>
					<Plus className="mr-2" />
					{t("addButton")}
				</Button>
				{showCancel && onCancel && (
					<Button type="button" variant="outline" size="lg" onClick={onCancel}>
						{t("cancel")}
					</Button>
				)}
			</div>
		</form>
	);
}
