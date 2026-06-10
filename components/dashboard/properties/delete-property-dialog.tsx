"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { Property } from "./types";

interface DeletePropertyDialogProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: (id: string) => Promise<void>;
}

export function DeletePropertyDialog({
	property,
	open,
	onOpenChange,
	onDelete,
}: DeletePropertyDialogProps) {
	const t = useTranslations("app.properties");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);

	useEffect(() => {
		if (property) {
			setIsSubmitting(false);
			setErrorOpen(false);
		}
	}, [property]);

	const handleDelete = async () => {
		if (!property) return;

		setIsSubmitting(true);

		try {
			await onDelete(property.id);
			onOpenChange(false);
		} catch {
			setIsSubmitting(false);
			setErrorOpen(true);
		}
	};

	if (!property) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-600" />
						{t("deleteTitle")}
					</DialogTitle>
					<DialogDescription className="sr-only">
						{t("deleteTitle")}
					</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="property-delete-loader"
						/>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground leading-relaxed">
							{t("deleteMessage", { name: property.name })}
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
				)}

				<ErrorDialog
					open={errorOpen}
					onOpenChange={setErrorOpen}
					title={t("errors.delete.title")}
					description={t("errors.delete.description")}
				/>
			</DialogContent>
		</Dialog>
	);
}
