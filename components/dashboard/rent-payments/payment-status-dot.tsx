import { useTranslations } from "next-intl";
import type { PaymentStatus } from "./types";

interface PaymentStatusDotProps {
	status?: PaymentStatus | null;
}

export function PaymentStatusDot({ status }: PaymentStatusDotProps) {
	const t = useTranslations("app.rentPayments.form");
	if (!status) return null;

	const label = `Latest payment status: ${
		status === "paid" ? t("statusPaid") : t("statusPending")
	}`;

	const bgClass = status === "paid" ? "bg-green-500/80" : "bg-amber-500/80";

	return (
		<span className="flex items-center">
			<span
				aria-hidden
				className={`${bgClass} h-2.5 w-2.5 rounded-full inline-block`}
			/>
			<span className="sr-only">{label}</span>
		</span>
	);
}
