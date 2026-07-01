"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
import { getServiceIcon } from "./types";

interface UpsertServiceDialogProps {
	mode: "add" | "edit";
	service?: Service;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	customServiceNotice?: string;
	availableServices?: Service[];
	availableTitle?: string;
	onSave: (
		id: string | null,
		name: string,
		unitLabel: string | null,
		pricingType: "flat" | "variable",
		flatAmount: number | null,
		unitPrice: number | null,
		serviceRefId?: string,
	) => Promise<void>;
}

export function UpsertServiceDialog({
	mode,
	service,
	open,
	onOpenChange,
	customServiceNotice,
	availableServices,
	availableTitle,
	onSave,
}: UpsertServiceDialogProps) {
	const t = useTranslations("app.services");
	const locale = useLocale();
	const currency = locale === "vi" ? "VND" : "USD";
	const [serviceName, setServiceName] = useState("");
	const [unitLabel, setUnitLabel] = useState("");
	const [pricingType, setPricingType] = useState<"flat" | "variable">("flat");
	const [amount, setAmount] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedServiceRefId, setSelectedServiceRefId] = useState<
		string | null
	>(null);

	useEffect(() => {
		if (open) {
			setIsSubmitting(false);
			setErrorOpen(false);
			setErrorMessage("");
			setSelectedServiceRefId(null);
		}
		if (service) {
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
	}, [service, open]);

	const handleSelectAvailable = (service: Service) => {
		setServiceName(service.name);
		setPricingType(service.pricingType);
		setUnitLabel(service.unitLabel ?? "");
		setSelectedServiceRefId(service.id);
		setAmount(
			service.pricingType === "flat"
				? (service.flatAmount?.toString() ?? "")
				: (service.unitPrice?.toString() ?? ""),
		);
	};

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
				selectedServiceRefId ?? undefined,
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
					{customServiceNotice && (
						<p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 text-center">
							<span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
							{customServiceNotice}
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
					<form onSubmit={handleSubmit} className="space-y-6">
						{mode === "add" &&
							availableServices &&
							availableServices.length > 0 && (
								<div className="space-y-3">
									<p className="text-sm text-muted-foreground">
										{availableTitle ?? t("quickAdd")}
									</p>
									<div className="flex flex-wrap gap-2">
										{availableServices.map((service) => {
											const Icon = getServiceIcon(service.name);
											return (
												<Button
													key={service.id}
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleSelectAvailable(service)}
												>
													<Icon className="mr-1.5 h-3.5 w-3.5" />
													{service.name}
												</Button>
											);
										})}
									</div>
									<div className="relative">
										<div className="absolute inset-0 flex items-center">
											<span className="w-full border-t" />
										</div>
										<div className="relative flex justify-center text-xs uppercase">
											<span className="bg-background px-2 text-muted-foreground">
												{t("orCustom")}
											</span>
										</div>
									</div>
								</div>
							)}
						<div className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="serviceName" className="text-sm font-medium">
									{t("name")}
								</label>
								<Input
									id="serviceName"
									type="text"
									value={serviceName}
									onChange={(e) => setServiceName(e.target.value)}
									className="text-base h-12 mt-2"
									autoFocus
								/>
							</div>

							<div className="space-y-2">
								<label htmlFor="unitLabel" className="text-sm font-medium">
									{t("unitLabel")}
									<span className="text-muted-foreground font-normal ml-1">
										({t("optional")})
									</span>
								</label>
								<Input
									id="unitLabel"
									type="text"
									value={unitLabel}
									onChange={(e) => setUnitLabel(e.target.value)}
									className="text-base h-12 mt-2"
								/>
							</div>

							<fieldset className="space-y-2">
								<legend id="pricingType-legend" className="text-sm font-medium">
									{t("pricingType")}
								</legend>
								<div
									className="flex gap-4 mt-2"
									role="radiogroup"
									aria-labelledby="pricingType-legend"
								>
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="pricingType"
											value="flat"
											checked={pricingType === "flat"}
											onChange={() => {
												setPricingType("flat");
												setAmount("");
											}}
											className="h-4 w-4"
										/>
										<span className="text-sm">{t("flat")}</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="pricingType"
											value="variable"
											checked={pricingType === "variable"}
											onChange={() => {
												setPricingType("variable");
												setAmount("");
											}}
											className="h-4 w-4"
										/>
										<span className="text-sm">{t("variable")}</span>
									</label>
								</div>
							</fieldset>

							<div className="space-y-2">
								<label htmlFor="amount" className="text-sm font-medium">
									{pricingType === "flat" ? t("flatAmount") : t("unitPrice")}
								</label>
								<div className="relative">
									<Input
										id="amount"
										type="number"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										placeholder={
											pricingType === "flat"
												? t("flatAmountPlaceholder")
												: t("unitPricePlaceholder")
										}
										className="text-base h-12 pr-16 mt-2"
										min="0"
										step="0.01"
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
