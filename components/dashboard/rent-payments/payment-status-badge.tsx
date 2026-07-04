import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "./types";

interface PaymentStatusBadgeProps {
	status: PaymentStatus;
	onClick: () => void;
	isLoading?: boolean;
}

export function PaymentStatusBadge({
	status,
	onClick,
	isLoading,
}: PaymentStatusBadgeProps) {
	const t = useTranslations("app.rentPayments.form");

	return (
		<button
			type="button"
			disabled={isLoading}
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onClick();
			}}
			className={cn(
				"inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:pointer-events-none",
				status === "paid"
					? "border-green-500/40 text-green-500 hover:border-green-500/80 hover:bg-green-500/10"
					: "border-amber-500/40 text-amber-500 hover:border-amber-500/80 hover:bg-amber-500/10",
			)}
		>
			{isLoading ? (
				<Loader2 className="h-3 w-3 animate-spin" />
			) : status === "paid" ? (
				t("statusPaid")
			) : (
				t("statusPending")
			)}
		</button>
	);
}
