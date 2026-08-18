"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
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

interface DeleteAccountDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void>;
}

export function DeleteAccountDialog({
	open,
	onOpenChange,
	onConfirm,
}: DeleteAccountDialogProps) {
	const t = useTranslations("app.settings");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);
	const [confirmText, setConfirmText] = useState("");

	const handleConfirm = async () => {
		setIsSubmitting(true);

		try {
			await onConfirm();
			onOpenChange(false);
		} catch {
			setIsSubmitting(false);
			setErrorOpen(true);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center justify-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-600" />
						{t("deleteAccountTitle")}
					</DialogTitle>
					<DialogDescription className="sr-only">
						{t("deleteAccountTitle")}
					</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="delete-account-loader"
						/>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground leading-relaxed">
							{t("deleteAccountMessage")}
						</p>

						<div className="space-y-2">
							<label htmlFor="delete-confirm" className="text-sm font-medium">
								{t("deleteAccountConfirmLabel")}
							</label>
							<Input
								id="delete-confirm"
								value={confirmText}
								onChange={(e) => setConfirmText(e.target.value)}
								placeholder="DELETE"
								data-testid="delete-confirm-input"
							/>
						</div>

						<div className="flex gap-3">
							<Button
								type="button"
								variant="destructive"
								size="lg"
								className="flex-1"
								disabled={confirmText !== "DELETE"}
								onClick={handleConfirm}
							>
								{t("deleteAccountConfirm")}
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
