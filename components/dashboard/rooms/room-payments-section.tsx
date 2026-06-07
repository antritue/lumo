"use client";

import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { RentPaymentsList } from "@/components/dashboard/rent-payments/rent-payments-list";
import type { PaymentRecord } from "@/components/dashboard/rent-payments/types";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

interface RoomPaymentsSectionProps {
	payments: PaymentRecord[];
	onAdd: () => void;
	onEdit: (payment: PaymentRecord) => void;
	onDelete: (payment: PaymentRecord) => void;
	isPaymentsLoading?: boolean;
	paymentsFetchFailed?: boolean;
	onRetryPayments?: () => void;
}

export function RoomPaymentsSection({
	payments,
	onAdd,
	onEdit,
	onDelete,
	isPaymentsLoading,
	paymentsFetchFailed,
	onRetryPayments,
}: RoomPaymentsSectionProps) {
	const t = useTranslations("app.rentPayments");

	return (
		<div className="space-y-4">
			{!paymentsFetchFailed && (
				<div className="flex items-center justify-between">
					<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
						{t("listTitle")}
					</h2>
					<Button
						onClick={onAdd}
						variant="default"
						size="sm"
						disabled={isPaymentsLoading}
					>
						<Plus className="mr-2 h-4 w-4" />
						{t("addButton")}
					</Button>
				</div>
			)}

			{paymentsFetchFailed ? (
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
