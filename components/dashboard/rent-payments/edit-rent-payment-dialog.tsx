"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { PaymentRecord } from "./types";

interface EditRentPaymentDialogProps {
	payment: PaymentRecord;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (id: string, period: string, amount: number) => void;
}

export function EditRentPaymentDialog({
	payment,
	open,
	onOpenChange,
	onSave,
}: EditRentPaymentDialogProps) {
	const t = useTranslations("app.rentPayments");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	const [period, setPeriod] = useState(payment.period);
	const [amount, setAmount] = useState(payment.amount.toString());

	// Reset form when dialog opens with new payment
	useEffect(() => {
		setPeriod(payment.period);
		setAmount(payment.amount.toString());
	}, [payment]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		handleSave();
	};

	const handleSave = () => {
		const parsedAmount = Number.parseFloat(amount);
		if (period && !Number.isNaN(parsedAmount) && parsedAmount > 0) {
			onSave(payment.id, period, parsedAmount);
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("editTitle")}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="period" className="text-sm font-medium">
								{t("form.period")}
							</label>
							<Input
								id="period"
								type="month"
								value={period}
								onChange={(e) => setPeriod(e.target.value)}
								className="text-base h-12 mt-2"
								autoFocus
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="amount" className="text-sm font-medium">
								{t("form.amount")}
							</label>
							<div className="relative">
								<Input
									id="amount"
									type="number"
									step="0.01"
									min="0"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									className="text-base h-12 pr-16 mt-2"
									required
								/>
								<span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
									{currency}
								</span>
							</div>
						</div>
					</div>

					<div className="flex gap-3">
						<Button
							type="button"
							size="lg"
							className="flex-1"
							disabled={!period || !amount || Number.parseFloat(amount) <= 0}
							onClick={handleSave}
						>
							{t("form.save")}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="lg"
							className="flex-1"
							onClick={() => onOpenChange(false)}
						>
							{t("form.cancel")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
