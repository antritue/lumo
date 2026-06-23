"use client";

import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { RentPaymentsList } from "@/components/dashboard/rent-payments/rent-payments-list";
import type { PaymentRecord } from "@/components/dashboard/rent-payments/types";
import { ErrorState } from "@/components/shared/error-state";

interface RoomPaymentsSectionProps {
	payments: PaymentRecord[];
	onAdd: () => void;
	onEdit: (payment: PaymentRecord) => void;
	onDelete: (payment: PaymentRecord) => void;
	isPaymentsLoading?: boolean;
	isPaymentsFetchFailed?: boolean;
	onRetryPayments?: () => void;
}

export function RoomPaymentsSection({
	payments,
	onAdd,
	onEdit,
	onDelete,
	isPaymentsLoading,
	isPaymentsFetchFailed,
	onRetryPayments,
}: RoomPaymentsSectionProps) {
	const t = useTranslations("app.rentPayments");

	return (
		<div className="space-y-4">
			{!isPaymentsFetchFailed && (
				<div className="flex items-center gap-3">
					<h3 className="text-sm font-medium text-foreground">
						{t("listTitle")}
					</h3>
					<div className="flex-1" />
					<button
						type="button"
						onClick={onAdd}
						disabled={isPaymentsLoading}
						className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
						aria-label={t("addButton")}
					>
						<Plus className="h-4 w-4" />
					</button>
				</div>
			)}

			{isPaymentsFetchFailed ? (
				<ErrorState onRetry={onRetryPayments} />
			) : isPaymentsLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<RentPaymentsList
					payments={payments}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			)}
		</div>
	);
}
