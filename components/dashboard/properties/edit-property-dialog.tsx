"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
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
	onSave: (id: string, name: string) => void;
}

export function EditPropertyDialog({
	property,
	open,
	onOpenChange,
	onSave,
}: EditPropertyDialogProps) {
	const t = useTranslations("app.properties");
	const [propertyName, setPropertyName] = useState("");

	// Reset form when dialog opens with new property
	useEffect(() => {
		if (property) {
			setPropertyName(property.name);
		}
	}, [property]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		const trimmedName = propertyName.trim();

		if (!trimmedName || !property) return;

		onSave(property.id, trimmedName);
		onOpenChange(false);
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
			</DialogContent>
		</Dialog>
	);
}
