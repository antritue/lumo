"use client";

import {
	ChevronDown,
	ChevronRight,
	MoreHorizontal,
	Pencil,
	Receipt,
	Trash2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatusBadge } from "./payment-status-badge";
import type { PaymentRecord, ServiceCharge } from "./types";

interface RentPaymentsListProps {
	payments: PaymentRecord[];
	onEdit?: (payment: PaymentRecord) => void;
	onDelete?: (payment: PaymentRecord) => void;
	onToggleStatus: (payment: PaymentRecord) => void;
	togglingPaymentId: string | null;
	serviceChargesByPeriod?: Record<string, ServiceCharge[]>;
}

export function RentPaymentsList({
	payments,
	onEdit,
	onDelete,
	onToggleStatus,
	togglingPaymentId,
	serviceChargesByPeriod = {},
}: RentPaymentsListProps) {
	const t = useTranslations("app.rentPayments");
	const locale = useLocale();
	const [expandedId, setExpandedId] = useState<string | null>(null);

	if (payments.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center text-center py-8">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-4">
					<Receipt className="h-6 w-6 text-muted-foreground" />
				</div>
				<p className="text-base font-medium text-foreground mb-1">
					{t("emptyMessage")}
				</p>
				<p className="text-sm text-muted-foreground max-w-sm">
					{t("emptySubtitle")}
				</p>
			</div>
		);
	}

	const formatPeriod = (period: string) => {
		const [year, month] = period.split("-");
		return `${month}-${year}`;
	};

	const calculateServiceTotal = (charges: ServiceCharge[]): number => {
		return charges.reduce((sum, c) => sum + c.total, 0);
	};

	const toggleExpand = (id: string) => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

	return (
		<div className="space-y-2">
			{payments.map((payment) => {
				const isExpanded = expandedId === payment.id;
				const charges = serviceChargesByPeriod[payment.period];
				const serviceTotal = charges ? calculateServiceTotal(charges) : 0;

				return (
					<div key={payment.id}>
						<div className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border hover:bg-muted/50 transition-colors w-full">
							<button
								type="button"
								onClick={() => toggleExpand(payment.id)}
								className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer bg-transparent border-0 p-0"
							>
								{charges && charges.length > 0 ? (
									isExpanded ? (
										<ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
									) : (
										<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
									)
								) : (
									<div className="flex items-center justify-center rounded-lg bg-secondary p-2 shrink-0">
										<Receipt className="h-4 w-4 text-muted-foreground" />
									</div>
								)}
								<div className="flex items-center gap-2 min-w-0">
									<p className="text-sm font-medium text-foreground">
										{formatPeriod(payment.period)}
									</p>
									<PaymentStatusBadge
										status={payment.status}
										onClick={() => onToggleStatus(payment)}
										isLoading={togglingPaymentId === payment.id}
									/>
								</div>
								<div className="flex-1" />
								<div className="text-right">
									<p className="text-sm font-semibold text-foreground">
										{formatCurrency(payment.rentAmount + serviceTotal, locale)}
									</p>
									{serviceTotal > 0 && (
										<p className="text-xs text-muted-foreground">
											{t("includesServices")}
										</p>
									)}
								</div>
							</button>
							{(onEdit || onDelete) && (
								<Popover>
									<PopoverTrigger asChild>
										<button
											type="button"
											onClick={(e) => e.stopPropagation()}
											className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors cursor-pointer shrink-0"
										>
											<MoreHorizontal className="h-4 w-4" />
										</button>
									</PopoverTrigger>
									<PopoverContent align="end" className="w-36 p-1.5">
										<div className="flex flex-col gap-0.5">
											{onEdit && (
												<button
													type="button"
													onClick={() => onEdit(payment)}
													className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors cursor-pointer text-left"
												>
													<Pencil className="h-3.5 w-3.5" />
													{t("edit")}
												</button>
											)}
											{onDelete && (
												<button
													type="button"
													onClick={() => onDelete(payment)}
													className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted hover:text-destructive transition-colors cursor-pointer text-left"
												>
													<Trash2 className="h-3.5 w-3.5" />
													{t("delete")}
												</button>
											)}
										</div>
									</PopoverContent>
								</Popover>
							)}
						</div>

						{isExpanded && charges && charges.length > 0 && (
							<div className="mx-3.5 px-3 py-3 rounded-b-xl border border-t-0 border-border bg-muted/30">
								<div className="space-y-2">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">{t("rent")}</span>
										<span className="font-medium">
											{formatCurrency(payment.rentAmount, locale)}
										</span>
									</div>
									{charges.map((charge) => (
										<div
											key={charge.serviceId}
											className="flex items-center justify-between text-sm"
										>
											<span className="text-muted-foreground">
												{charge.serviceName}
												{charge.pricingType === "variable" &&
													charge.usage != null && (
														<span className="text-xs text-muted-foreground ml-1">
															({charge.usage} {charge.unitLabel ?? ""} ×{" "}
															{formatCurrency(charge.unitPrice ?? 0, locale)})
														</span>
													)}
											</span>
											<span className="font-medium">
												{formatCurrency(charge.total, locale)}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
