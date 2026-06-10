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

interface EditPropertyDialogProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (id: string, name: string) => Promise<void>;
}

export function EditPropertyDialog({
	property,
	open,
	onOpenChange,
	onSave,
}: EditPropertyDialogProps) {
	const t = useTranslations("app.properties");
	const [propertyName, setPropertyName] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Reset form when dialog opens with new property
	useEffect(() => {
		if (property) {
			setPropertyName(property.name);
			setIsSubmitting(false);
			setErrorOpen(false);
			setErrorMessage("");
		}
	}, [property]);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const trimmedName = propertyName.trim();

		if (!trimmedName || !property) return;

		setIsSubmitting(true);

		try {
			await onSave(property.id, trimmedName);
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
							data-testid="property-edit-loader"
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
