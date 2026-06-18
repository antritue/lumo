"use client";

import { MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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

	return (
		<div className="space-y-2">
			{payments.map((payment) => (
				<div
					key={payment.id}
					className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
				>
					<div className="flex items-center justify-center rounded-lg bg-secondary p-2 shrink-0">
						<Receipt className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="flex items-center gap-2 min-w-0">
						<p className="text-sm font-medium text-foreground">
							{formatPeriod(payment.period)}
						</p>
						<PaymentStatusBadge status={payment.status} />
					</div>
					<div className="flex-1" />
					<p className="text-sm font-semibold text-foreground">
						{formatCurrency(payment.amount, locale)}
					</p>
					{(onEdit || onDelete) && (
						<Popover>
							<PopoverTrigger asChild>
								<button
									type="button"
									className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors cursor-pointer"
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
			))}
		</div>
	);
}
