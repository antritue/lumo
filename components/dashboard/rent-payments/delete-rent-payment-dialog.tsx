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
import type { PaymentRecord } from "./types";

interface DeleteRentPaymentDialogProps {
	payment: PaymentRecord;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (id: string) => void;
}

export function DeleteRentPaymentDialog({
	payment,
	open,
	onOpenChange,
	onConfirm,
}: DeleteRentPaymentDialogProps) {
	const t = useTranslations("app.rentPayments");

	const handleConfirm = () => {
		onConfirm(payment.id);
		onOpenChange(false);
	};

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
						{t("deleteDescription")}
					</p>

					<div className="flex gap-3">
						<Button
							type="button"
							variant="destructive"
							size="lg"
							className="flex-1"
							onClick={handleConfirm}
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
							{t("form.cancel")}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
