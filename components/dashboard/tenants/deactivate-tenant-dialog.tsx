"use client";

import { Loader2, UserMinus } from "lucide-react";
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

interface DeactivateTenantDialogProps {
	tenant: Tenant | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (id: string) => Promise<void>;
}

export function DeactivateTenantDialog({
	tenant,
	open,
	onOpenChange,
	onConfirm,
}: DeactivateTenantDialogProps) {
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
						<UserMinus className="h-5 w-5 text-muted-foreground" />
						{t("deactivateDialog.title", { name: tenant.fullName })}
					</DialogTitle>
					<DialogDescription className="sr-only">
						{t("deactivateDialog.title", { name: tenant.fullName })}
					</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="tenant-deactivate-loader"
						/>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm leading-relaxed text-muted-foreground">
							{t("deactivateDialog.message", { name: tenant.fullName })}
						</p>

						<div className="flex gap-3">
							<Button
								type="button"
								size="lg"
								className="flex-1"
								onClick={handleConfirm}
							>
								{t("deactivateDialog.confirm")}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="flex-1"
								onClick={() => onOpenChange(false)}
								autoFocus
							>
								{t("deactivateDialog.cancel")}
							</Button>
						</div>
					</div>
				)}

				<ErrorDialog
					open={errorOpen}
					onOpenChange={setErrorOpen}
					title={t("errors.update.title")}
					description={t("errors.update.description")}
				/>
			</DialogContent>
		</Dialog>
	);
}
