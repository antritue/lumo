"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
import type { Property } from "./types";

interface UpsertPropertyDialogProps {
	mode: "add" | "edit";
	property?: Property;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (id: string | null, name: string) => Promise<void>;
}

export function UpsertPropertyDialog({
	mode,
	property,
	open,
	onOpenChange,
	onSave,
}: UpsertPropertyDialogProps) {
	const t = useTranslations("app.properties");
	const [propertyName, setPropertyName] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			setIsSubmitting(false);
			setErrorOpen(false);
			setErrorMessage("");
		}
		if (mode === "edit" && property) {
			setPropertyName(property.name);
		} else {
			setPropertyName("");
		}
	}, [mode, property, open]);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const trimmedName = propertyName.trim();
		if (!trimmedName) return;

		setIsSubmitting(true);

		try {
			const id = mode === "edit" && property ? property.id : null;
			await onSave(id, trimmedName);
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
							data-testid="property-upsert-loader"
						/>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							type="text"
							value={propertyName}
							onChange={(e) => setPropertyName(e.target.value)}
							placeholder={t("inputPlaceholder")}
							className="text-base h-12"
							autoFocus
						/>

						<div className="flex gap-3">
							<Button
								type="submit"
								size="lg"
								className="flex-1"
								disabled={!propertyName.trim()}
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
