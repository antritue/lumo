"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
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
	onDelete: (id: string) => void;
}

export function DeletePropertyDialog({
	property,
	open,
	onOpenChange,
	onDelete,
}: DeletePropertyDialogProps) {
	const t = useTranslations("app.properties");

	const handleDelete = () => {
		if (!property) return;
		onDelete(property.id);
		onOpenChange(false);
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

				<div className="space-y-4">
					<p className="text-sm text-muted-foreground leading-relaxed">
						{t("deleteMessage", { name: property.name })}
					</p>

					<div className="flex gap-3">
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
						<Button
							type="button"
							variant="destructive"
							size="lg"
							className="flex-1"
							onClick={handleDelete}
						>
							{t("deleteConfirm")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
