"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PaymentRecord } from "@/components/dashboard/rent-payments/types";
import { cn } from "@/lib/utils";
import { useOverviewStore } from "./store";

interface StatusBadgeProps {
	payment: PaymentRecord;
}

export function StatusBadge({ payment }: StatusBadgeProps) {
	const t = useTranslations("app.overview");
	const togglingPaymentId = useOverviewStore(
		(state) => state.togglingPaymentId,
	);
	const togglePaymentStatus = useOverviewStore(
		(state) => state.togglePaymentStatus,
	);

	const isLoading = togglingPaymentId === payment.id;
	const label =
		payment.status === "paid" ? t("statusPaid") : t("statusPending");

	return (
		<button
			type="button"
			disabled={isLoading}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				togglePaymentStatus(payment);
			}}
			className={cn(
				"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:pointer-events-none",
				payment.status === "paid"
					? "border-green-500/40 text-green-500 hover:border-green-500/80 hover:bg-green-500/10"
					: "border-amber-500/40 text-amber-500 hover:border-amber-500/80 hover:bg-amber-500/10",
			)}
		>
			{isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : label}
		</button>
	);
}

export function NotRecordedBadge() {
	const t = useTranslations("app.overview");

	return (
		<span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
			{t("statusNotRecorded")}
		</span>
	);
}
