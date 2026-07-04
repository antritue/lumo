"use client";

import { Info, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { RentPaymentsList } from "@/components/dashboard/rent-payments/rent-payments-list";
import type {
	PaymentRecord,
	ServiceCharge,
} from "@/components/dashboard/rent-payments/types";
import { ErrorState } from "@/components/shared/error-state";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomPaymentsSectionProps {
	payments: PaymentRecord[];
	onAdd: () => void;
	onEdit: (payment: PaymentRecord) => void;
	onDelete: (payment: PaymentRecord) => void;
	onToggleStatus: (payment: PaymentRecord) => void;
	togglingPaymentId: string | null;
	isPaymentsLoading?: boolean;
	isPaymentsFetchFailed?: boolean;
	onRetryPayments?: () => void;
	serviceChargesByPeriod?: Record<string, ServiceCharge[]>;
}

export function RoomPaymentsSection({
	payments,
	onAdd,
	onEdit,
	onDelete,
	onToggleStatus,
	togglingPaymentId,
	isPaymentsLoading,
	isPaymentsFetchFailed,
	onRetryPayments,
	serviceChargesByPeriod,
}: RoomPaymentsSectionProps) {
	const t = useTranslations("app.rentPayments");

	return (
		<div className="space-y-4">
			{!isPaymentsFetchFailed && (
				<div className="flex items-center gap-3">
					<h3 className="text-sm font-medium text-foreground">
						{t("listTitle")}
					</h3>
					<Popover>
						<PopoverTrigger asChild>
							<button
								type="button"
								className="flex items-center justify-center h-4 w-4 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
								aria-label={t("statusToggleInfoLabel")}
							>
								<Info className="h-3.5 w-3.5" />
							</button>
						</PopoverTrigger>
						<PopoverContent
							side="top"
							align="start"
							className="max-w-64 text-xs leading-relaxed space-y-2"
						>
							<p>{t("statusToggleTooltip")}</p>
						</PopoverContent>
					</Popover>
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
				<div className="space-y-2">
					{["rp-sk-0", "rp-sk-1"].map((key) => (
						<div
							key={key}
							className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
						>
							<Skeleton className="h-8 w-8 rounded-lg" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-5 w-16 rounded-full" />
							<div className="flex-1" />
							<Skeleton className="h-4 w-20" />
							<Skeleton className="h-7 w-7 rounded-md" />
						</div>
					))}
				</div>
			) : (
				<RentPaymentsList
					payments={payments}
					onEdit={onEdit}
					onDelete={onDelete}
					onToggleStatus={onToggleStatus}
					togglingPaymentId={togglingPaymentId}
					serviceChargesByPeriod={serviceChargesByPeriod}
				/>
			)}
		</div>
	);
}
