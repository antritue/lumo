"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { type SubmitEvent, useEffect, useMemo, useState } from "react";
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
import { MonthPicker } from "./month-picker";
import type { PaymentRecord, PaymentStatus, ServiceCharge } from "./types";

interface UpsertRentPaymentDialogProps {
	mode: "add" | "edit";
	payment?: PaymentRecord;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (
		id: string | null,
		period: string,
		rentAmount: number,
		status: PaymentStatus,
	) => Promise<string>;
	defaultAmount?: number | null;
	existingPayments?: PaymentRecord[];
	initialServiceCharges: ServiceCharge[];
	onSaveServiceCharges?: (
		period: string,
		charges: ServiceCharge[],
		paymentId: string,
	) => void;
}

function formatCurrencyValue(value: number, locale: string): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: locale === "vi" ? "VND" : "USD",
		minimumFractionDigits: 0,
	}).format(value);
}

function calculateServiceChargesTotal(charges: ServiceCharge[]): number {
	return charges.reduce((sum, c) => sum + c.total, 0);
}

function calculateChargeTotal(charge: ServiceCharge): number {
	if (charge.pricingType === "flat") {
		return charge.flatAmount ?? 0;
	}
	return (charge.usage ?? 0) * (charge.unitPrice ?? 0);
}

export function UpsertRentPaymentDialog({
	mode,
	payment,
	open,
	onOpenChange,
	onSave,
	defaultAmount,
	existingPayments = [],
	initialServiceCharges,
	onSaveServiceCharges,
}: UpsertRentPaymentDialogProps) {
	const t = useTranslations("app.rentPayments");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";

	const currentMonth = new Date().toISOString().slice(0, 7);

	const [period, setPeriod] = useState(
		mode === "edit" && payment ? payment.period : currentMonth,
	);
	const [rentAmount, setRentAmount] = useState(
		mode === "edit" && payment
			? payment.rentAmount.toString()
			: defaultAmount
				? defaultAmount.toString()
				: "",
	);
	const [status, setStatus] = useState<PaymentStatus>(
		mode === "edit" && payment ? payment.status : "pending",
	);
	const [serviceCharges, setServiceCharges] = useState<ServiceCharge[]>([]);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const otherPayments =
		mode === "add"
			? existingPayments
			: existingPayments.filter((p) => p.id !== payment?.id);

	const takenMonths = otherPayments.map((p) => p.period);

	const isPeriodInvalid = period ? takenMonths.includes(period) : false;

	// Reset form when dialog opens
	useEffect(() => {
		if (open) {
			setIsSubmitting(false);
			setErrorOpen(false);
			setErrorMessage("");
		}
		if (mode === "edit" && payment) {
			setPeriod(payment.period);
			setRentAmount(payment.rentAmount.toString());
			setStatus(payment.status);
			setServiceCharges(initialServiceCharges);
		} else {
			setPeriod(currentMonth);
			setRentAmount(defaultAmount ? defaultAmount.toString() : "");
			setStatus("pending");
			setServiceCharges(initialServiceCharges);
		}
	}, [mode, payment, defaultAmount, currentMonth, open, initialServiceCharges]);

	const serviceChargesTotal = useMemo(
		() => calculateServiceChargesTotal(serviceCharges),
		[serviceCharges],
	);

	const parsedRentAmount = Number.parseFloat(rentAmount);
	const totalAmount = Number.isNaN(parsedRentAmount)
		? serviceChargesTotal
		: parsedRentAmount + serviceChargesTotal;

	const handleChargeFlatChange = (index: number, value: string) => {
		setServiceCharges((prev) => {
			if (value.startsWith("-")) return prev;
			const next = [...prev];
			const charge = { ...next[index] };
			const flatAmount = value === "" ? null : Number.parseFloat(value);
			charge.flatAmount = flatAmount;
			charge.total = calculateChargeTotal(charge);
			next[index] = charge;
			return next;
		});
	};

	const handleChargeUsageChange = (index: number, value: string) => {
		setServiceCharges((prev) => {
			if (value.startsWith("-")) return prev;
			const next = [...prev];
			const charge = { ...next[index] };
			const usage = value === "" ? null : Number.parseFloat(value);
			charge.usage = usage;
			charge.total = calculateChargeTotal(charge);
			next[index] = charge;
			return next;
		});
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		handleSave();
	};

	const handleSave = async () => {
		if (!period || Number.isNaN(parsedRentAmount) || parsedRentAmount <= 0)
			return;

		const id = mode === "edit" && payment ? payment.id : null;

		setIsSubmitting(true);

		try {
			const paymentId = await onSave(id, period, parsedRentAmount, status);
			if (onSaveServiceCharges) {
				onSaveServiceCharges(period, serviceCharges, paymentId);
			}
			onOpenChange(false);
		} catch {
			setErrorMessage(
				mode === "add"
					? t("errors.create.description")
					: t("errors.update.description"),
			);
			setErrorOpen(true);
			setIsSubmitting(false);
		}
	};

	const title = mode === "edit" ? t("editTitle") : t("addButton");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[100vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription className="sr-only">{title}</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="rent-payment-save-loader"
						/>
					</div>
				) : (
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
									disabledMonths={takenMonths}
									helperText={
										isPeriodInvalid ? t("form.errors.monthOccupied") : undefined
									}
									className="mt-2"
								/>
							</div>

							<div className="space-y-2">
								<label htmlFor="amount" className="text-sm font-medium">
									{t("rent")}
								</label>
								<div className="relative">
									<Input
										id="amount"
										type="number"
										step="0.01"
										min="0"
										value={rentAmount}
										onChange={(e) => setRentAmount(e.target.value)}
										className="text-base h-12 pr-16 mt-2"
										required
									/>
									<span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
										{currency}
									</span>
								</div>
							</div>

							{serviceCharges.length > 0 && (
								<div className="space-y-3">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium">{t("serviceCharges")}</p>
										<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
											{serviceCharges.length}
										</span>
									</div>
									<div className="rounded-xl border border-border divide-y divide-border">
										{serviceCharges.map((charge, index) => (
											<div
												key={charge.serviceId}
												className="flex items-center gap-4 px-4 py-3"
											>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium">
														{charge.serviceName}
													</p>
													{charge.pricingType === "flat" ? (
														<p className="text-xs text-muted-foreground">
															{t("flat")}
														</p>
													) : charge.unitPrice != null ? (
														<p className="text-xs text-muted-foreground">
															{formatCurrencyValue(charge.unitPrice, locale)}
															{charge.unitLabel
																? `/${charge.unitLabel}`
																: `/${t("unit")}`}
														</p>
													) : null}
												</div>
												{charge.pricingType === "flat" ? (
													<div className="relative w-48 shrink-0">
														<Input
															type="number"
															step="0.01"
															min="0"
															value={charge.flatAmount ?? ""}
															onChange={(e) =>
																handleChargeFlatChange(index, e.target.value)
															}
															className="text-sm h-9 pr-12 text-right"
														/>
														<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
															{currency}
														</span>
													</div>
												) : (
													<div className="flex items-center gap-2 w-48 shrink-0">
														<Input
															type="number"
															step="0.01"
															min="0"
															value={charge.usage ?? ""}
															onChange={(e) =>
																handleChargeUsageChange(index, e.target.value)
															}
															placeholder={charge.unitLabel ?? t("unit")}
															className="flex-1 min-w-0 text-sm h-9 text-right"
														/>
														<span className="text-sm font-medium whitespace-nowrap">
															{formatCurrencyValue(charge.total, locale)}
														</span>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{serviceCharges.length > 0 && (
								<div className="border-t border-border pt-4 space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">{t("rent")}</span>
										<span>
											{formatCurrencyValue(
												Number.isNaN(parsedRentAmount) ? 0 : parsedRentAmount,
												locale,
											)}
										</span>
									</div>
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											{t("serviceCharges")}
										</span>
										<span>
											{formatCurrencyValue(serviceChargesTotal, locale)}
										</span>
									</div>
									<div className="flex items-center justify-between border-t border-border pt-2">
										<span className="text-sm font-semibold">
											{t("totalWithServices")}
										</span>
										<span className="text-base font-bold text-primary">
											{formatCurrencyValue(totalAmount, locale)}
										</span>
									</div>
								</div>
							)}

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
											onChange={(e) =>
												setStatus(e.target.value as PaymentStatus)
											}
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
											onChange={(e) =>
												setStatus(e.target.value as PaymentStatus)
											}
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
								disabled={
									!period ||
									isPeriodInvalid ||
									!rentAmount ||
									Number.parseFloat(rentAmount) <= 0
								}
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
				)}

				<ErrorDialog
					open={errorOpen}
					onOpenChange={setErrorOpen}
					title={
						mode === "add" ? t("errors.create.title") : t("errors.update.title")
					}
					description={errorMessage}
				/>
			</DialogContent>
		</Dialog>
	);
}
