"use client";

import { Pencil, Receipt, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PaymentStatusBadge } from "./payment-status-badge";
import type { PaymentRecord } from "./types";

interface RentPaymentsListProps {
	payments: PaymentRecord[];
	onEdit?: (payment: PaymentRecord) => void;
	onDelete?: (payment: PaymentRecord) => void;
}

export function RentPaymentsList({
	payments,
	onEdit,
	onDelete,
}: RentPaymentsListProps) {
	const t = useTranslations("app.rentPayments");
	const locale = useLocale();

	if (payments.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center text-center">
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
		const date = new Date(Number(year), Number(month) - 1);
		return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
			year: "numeric",
			month: "long",
		}).format(date);
	};

	const handleEdit = (e: React.MouseEvent, payment: PaymentRecord) => {
		e.stopPropagation();
		onEdit?.(payment);
	};

	const handleDelete = (e: React.MouseEvent, payment: PaymentRecord) => {
		e.stopPropagation();
		onDelete?.(payment);
	};

	return (
		<div className="space-y-3">
			{payments.map((payment) => (
				<Card key={payment.id} className="group">
					<CardContent className="py-4 px-6">
						<div className="flex items-center gap-3">
							<div className="flex-1 min-w-0 space-y-1">
								<p className="text-base font-medium text-foreground">
									{formatPeriod(payment.period)}
								</p>
								<div className="flex items-center gap-2">
									<p className="text-xl font-semibold text-foreground">
										{formatCurrency(payment.amount, locale)}
									</p>
									<PaymentStatusBadge status={payment.status} />
								</div>
							</div>
							{(onEdit || onDelete) && (
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									{onEdit && (
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => handleEdit(e, payment)}
											aria-label={t("edit")}
											className="h-8 w-8 hover:bg-muted"
										>
											<Pencil className="h-3.5 w-3.5" />
										</Button>
									)}
									{onDelete && (
										<Button
											variant="ghost"
											size="icon"
											onClick={(e) => handleDelete(e, payment)}
											aria-label={t("delete")}
											className="h-8 w-8 hover:bg-muted hover:text-destructive"
										>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									)}
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
