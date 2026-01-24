import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "./types";

interface PaymentStatusBadgeProps {
	status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
	const t = useTranslations("app.rentPayments.form");

	return (
		<span
			className={cn(
				"inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
				status === "paid"
					? "border-green-500/40 text-green-500"
					: "border-amber-500/40 text-amber-500",
			)}
		>
			{status === "paid" ? t("statusPaid") : t("statusPending")}
		</span>
	);
}
