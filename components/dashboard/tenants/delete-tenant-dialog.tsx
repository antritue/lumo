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
import type { Tenant } from "./types";

interface DeleteTenantDialogProps {
	tenant: Tenant | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (id: string) => Promise<void>;
}

export function DeleteTenantDialog({
	tenant,
	open,
	onOpenChange,
	onConfirm,
}: DeleteTenantDialogProps) {
	const t = useTranslations("app.tenants");

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);

	useEffect(() => {
		if (tenant) {
			setIsSubmitting(false);
			setErrorOpen(false);
		}
	}, [tenant]);

	const handleConfirm = async () => {
		if (!tenant) return;

		setIsSubmitting(true);

		try {
			await onConfirm(tenant.id);
			onOpenChange(false);
		} catch {
			setIsSubmitting(false);
			setErrorOpen(true);
		}
	};

	if (!tenant) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-600" />
						{t("deleteDialog.title")}
					</DialogTitle>
					<DialogDescription className="sr-only">
						{t("deleteDialog.title")}
					</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="tenant-delete-loader"
						/>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm leading-relaxed text-muted-foreground">
							{t("deleteDialog.message", { name: tenant.fullName })}
						</p>

						<div className="flex gap-3">
							<Button
								type="button"
								variant="destructive"
								size="lg"
								className="flex-1"
								onClick={handleConfirm}
							>
								{t("deleteDialog.confirm")}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="flex-1"
								onClick={() => onOpenChange(false)}
								autoFocus
							>
								{t("deleteDialog.cancel")}
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
