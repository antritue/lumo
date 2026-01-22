"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PaymentRecord } from "@/components/dashboard/rent-payments";
import { RentPaymentsList } from "@/components/dashboard/rent-payments";
import { Button } from "@/components/ui/button";

interface RoomPaymentsSectionProps {
	payments: PaymentRecord[];
	onAdd: () => void;
	onEdit: (payment: PaymentRecord) => void;
	onDelete: (payment: PaymentRecord) => void;
}

export function RoomPaymentsSection({
	payments,
	onAdd,
	onEdit,
	onDelete,
}: RoomPaymentsSectionProps) {
	const t = useTranslations("app.rentPayments");

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
					{t("listTitle")}
				</h2>
				<Button onClick={onAdd} variant="outline" size="sm">
					<Plus className="mr-2 h-4 w-4" />
					{t("addButton")}
				</Button>
			</div>

			<RentPaymentsList
				payments={payments}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		</div>
	);
}
