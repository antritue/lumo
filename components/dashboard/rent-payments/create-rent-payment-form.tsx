"use client";

import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateRentPaymentFormProps {
	onSubmit: (period: string, amount: number) => void;
	onCancel?: () => void;
	defaultAmount?: number | null;
}

export function CreateRentPaymentForm({
	onSubmit,
	onCancel,
	defaultAmount = null,
}: CreateRentPaymentFormProps) {
	const t = useTranslations("app.rentPayments");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	// Default to current month in YYYY-MM format
	const currentMonth = new Date().toISOString().slice(0, 7);

	const [period, setPeriod] = useState(currentMonth);
	const [amount, setAmount] = useState(
		defaultAmount ? defaultAmount.toString() : "",
	);

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault();

		if (!period.trim() || !amount.trim()) return;

		const amountValue = Number.parseFloat(amount);
		if (Number.isNaN(amountValue) || amountValue <= 0) return;

		onSubmit(period.trim(), amountValue);
		setPeriod(currentMonth);
		setAmount(defaultAmount ? defaultAmount.toString() : "");
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="space-y-2">
					<label
						htmlFor="period"
						className="text-sm text-muted-foreground block"
					>
						{t("periodLabel")}
					</label>
					<Input
						id="period"
						type="month"
						value={period}
						onChange={(e) => setPeriod(e.target.value)}
						className="text-base h-12"
						required
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="amount"
						className="text-sm text-muted-foreground block"
					>
						{t("amountLabel")}
					</label>
					<div className="relative">
						<Input
							id="amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder={t("amountPlaceholder")}
							className="text-base h-12 pr-16"
							min="0"
							step="0.01"
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
					type="submit"
					size="lg"
					className="flex-1"
					disabled={!period.trim() || !amount.trim()}
				>
					<Plus className="mr-2" />
					{t("saveButton")}
				</Button>
				{onCancel && (
					<Button
						type="button"
						variant="outline"
						size="lg"
						className="flex-1"
						onClick={onCancel}
					>
						{t("cancel")}
					</Button>
				)}
			</div>
		</form>
	);
}
