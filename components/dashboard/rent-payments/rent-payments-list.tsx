"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { PaymentRecord } from "./types";

interface RentPaymentsListProps {
	payments: PaymentRecord[];
}

export function RentPaymentsList({ payments }: RentPaymentsListProps) {
	const t = useTranslations("app.rentPayments");
	const locale = useLocale();

	if (payments.length === 0) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="text-center">
						<p className="text-base text-muted-foreground">
							{t("emptyMessage")}
						</p>
					</div>
				</CardContent>
			</Card>
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

	return (
		<div className="space-y-3">
			{payments.map((payment) => (
				<Card key={payment.id}>
					<CardContent className="py-4 px-6">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-base font-medium text-foreground">
									{formatPeriod(payment.period)}
								</p>
							</div>
							<p className="text-xl font-semibold text-foreground">
								{formatCurrency(payment.amount, locale)}
							</p>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
