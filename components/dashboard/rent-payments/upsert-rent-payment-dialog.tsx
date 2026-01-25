"use client";

import { useLocale, useTranslations } from "next-intl";
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
import { MonthPicker } from "./month-picker";
import type { PaymentRecord, PaymentStatus } from "./types";

interface UpsertRentPaymentDialogProps {
	mode: "add" | "edit";
	payment?: PaymentRecord;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		id: string | null,
		period: string,
		amount: number,
		status: PaymentStatus,
	) => void;
	defaultAmount?: number | null;
}

export function UpsertRentPaymentDialog({
	mode,
	payment,
	open,
	onOpenChange,
	onSave,
	defaultAmount,
}: UpsertRentPaymentDialogProps) {
	const t = useTranslations("app.rentPayments");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	// Default to current month for add mode
	const currentMonth = new Date().toISOString().slice(0, 7);

	const [period, setPeriod] = useState(
		mode === "edit" && payment ? payment.period : currentMonth,
	);
	const [amount, setAmount] = useState(
		mode === "edit" && payment
			? payment.amount.toString()
			: defaultAmount
				? defaultAmount.toString()
				: "",
	);
	const [status, setStatus] = useState<PaymentStatus>(
		mode === "edit" && payment ? payment.status : "pending",
	);

	// Reset form when dialog opens with new payment or mode changes
	useEffect(() => {
		if (mode === "edit" && payment) {
			setPeriod(payment.period);
			setAmount(payment.amount.toString());
			setStatus(payment.status);
		} else {
			setPeriod(currentMonth);
			setAmount(defaultAmount ? defaultAmount.toString() : "");
			setStatus("pending");
		}
	}, [mode, payment, defaultAmount, currentMonth]);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();
		handleSave();
	};

	const handleSave = () => {
		const parsedAmount = Number.parseFloat(amount);
		if (period && !Number.isNaN(parsedAmount) && parsedAmount > 0) {
			const id = mode === "edit" && payment ? payment.id : null;
			onSave(id, period, parsedAmount, status);
			onOpenChange(false);
		}
	};

	const title = mode === "edit" ? t("editTitle") : t("addButton");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="sr-only">{title}</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="period" className="text-sm font-medium">
								{t("form.period")}
							</label>
							<MonthPicker
								id="period"
								value={period}
								onChange={setPeriod}
								className="mt-2"
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

						<fieldset className="space-y-2">
							<legend id="status-legend" className="text-sm font-medium">
								{t("form.status")}
							</legend>
							<div
								className="flex gap-4 mt-2"
								role="radiogroup"
								aria-labelledby="status-legend"
							>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="status"
										value="pending"
										checked={status === "pending"}
										onChange={(e) => setStatus(e.target.value as PaymentStatus)}
										className="h-4 w-4"
									/>
									<span className="text-sm">{t("form.statusPending")}</span>
								</label>
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="radio"
										name="status"
										value="paid"
										checked={status === "paid"}
										onChange={(e) => setStatus(e.target.value as PaymentStatus)}
										className="h-4 w-4"
									/>
									<span className="text-sm">{t("form.statusPaid")}</span>
								</label>
							</div>
						</fieldset>
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
