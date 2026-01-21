"use client";

import { useTranslations } from "next-intl";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CreateRentPaymentForm } from "./create-rent-payment-form";

interface AddRentPaymentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (period: string, amount: number) => void;
	defaultAmount?: number | null;
}

export function AddRentPaymentDialog({
	open,
	onOpenChange,
	onSubmit,
	defaultAmount,
}: AddRentPaymentDialogProps) {
	const t = useTranslations("app.rentPayments");

	const handleSubmit = (period: string, amount: number) => {
		onSubmit(period, amount);
		onOpenChange(false);
	};

	const handleCancel = () => {
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("addButton")}</DialogTitle>
				</DialogHeader>

				<CreateRentPaymentForm
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					defaultAmount={defaultAmount}
				/>
			</DialogContent>
		</Dialog>
	);
}
