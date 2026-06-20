"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type SubmitEvent, useEffect, useState } from "react";
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
import type { Service } from "./types";

interface UpsertServiceDialogProps {
	mode: "add" | "edit";
	service?: Service;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	isCustomService?: boolean;
	onSave: (
		id: string | null,
		name: string,
		unitLabel: string | null,
		pricingType: "flat" | "variable",
		flatAmount: number | null,
		unitPrice: number | null,
	) => Promise<void>;
}

export function UpsertServiceDialog({
	mode,
	service,
	open,
	onOpenChange,
	isCustomService = false,
	onSave,
}: UpsertServiceDialogProps) {
	const t = useTranslations("app.services");
	const [serviceName, setServiceName] = useState("");
	const [unitLabel, setUnitLabel] = useState("");
	const [pricingType, setPricingType] = useState<"flat" | "variable">("flat");
	const [amount, setAmount] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			setIsSubmitting(false);
			setErrorOpen(false);
			setErrorMessage("");
		}
		if (mode === "edit" && service) {
			setServiceName(service.name);
			setUnitLabel(service.unitLabel ?? "");
			setPricingType(service.pricingType);
			setAmount(
				service.pricingType === "flat"
					? (service.flatAmount?.toString() ?? "")
					: (service.unitPrice?.toString() ?? ""),
			);
		} else {
			setServiceName("");
			setUnitLabel("");
			setPricingType("flat");
			setAmount("");
		}
	}, [mode, service, open]);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		const trimmedName = serviceName.trim();
		if (!trimmedName) return;

		setIsSubmitting(true);

		try {
			const parsedAmount = amount ? Number.parseFloat(amount) : null;
			const id = mode === "edit" && service ? service.id : null;
			await onSave(
				id,
				trimmedName,
				unitLabel || null,
				pricingType,
				pricingType === "flat" ? parsedAmount : null,
				pricingType === "variable" ? parsedAmount : null,
			);
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{isCustomService && (
						<p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 text-center">
							<span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
							{t("customServiceNotice")}
						</p>
					)}
					<DialogDescription className="sr-only">{title}</DialogDescription>
				</DialogHeader>

				{isSubmitting ? (
					<div className="flex items-center justify-center py-8">
						<Loader2
							className="h-6 w-6 animate-spin text-muted-foreground"
							data-testid="service-save-loader"
						/>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<Input
							type="text"
							value={serviceName}
							onChange={(e) => setServiceName(e.target.value)}
							placeholder={t("inputPlaceholder")}
							className="text-base h-12"
							autoFocus
						/>
						<Input
							type="text"
							value={unitLabel}
							onChange={(e) => setUnitLabel(e.target.value)}
							placeholder={t("unitPlaceholder")}
							className="text-base h-12"
						/>

						<div className="flex gap-2">
							<Button
								type="button"
								variant={pricingType === "flat" ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setPricingType("flat");
									setAmount("");
								}}
								className="flex-1"
							>
								{t("flat")}
							</Button>
							<Button
								type="button"
								variant={pricingType === "variable" ? "default" : "outline"}
								size="sm"
								onClick={() => {
									setPricingType("variable");
									setAmount("");
								}}
								className="flex-1"
							>
								{t("variable")}
							</Button>
						</div>

						<Input
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder={
								pricingType === "flat"
									? t("flatAmountPlaceholder")
									: t("unitPricePlaceholder")
							}
							className="text-base h-12"
							min="0"
							step="0.01"
						/>

						<div className="flex gap-3">
							<Button
								type="submit"
								size="lg"
								className="flex-1"
								disabled={!serviceName.trim()}
							>
								{mode === "edit" ? t("saveButton") : t("addButton")}
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="flex-1"
								onClick={() => onOpenChange(false)}
							>
								{t("cancel")}
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
