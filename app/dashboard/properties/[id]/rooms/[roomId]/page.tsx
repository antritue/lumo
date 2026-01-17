"use client";

import { ArrowLeft, DoorOpen, Plus } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { use, useState } from "react";
import { usePropertiesStore } from "@/components/dashboard/properties";
import {
	CreateRentPaymentForm,
	RentPaymentsList,
	useRentPaymentsStore,
} from "@/components/dashboard/rent-payments";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoomDetailPage({
	params,
}: {
	params: Promise<{ id: string; roomId: string }>;
}) {
	const { id, roomId } = use(params);
	const t = useTranslations("app");
	const locale = useLocale();

	const property = usePropertiesStore((state) =>
		state.properties.find((p) => p.id === id),
	);
	const room = useRoomsStore((state) => state.getRoomById(roomId));
	const allRentPayments = useRentPaymentsStore((state) => state.rentPayments);
	const rentPayments = allRentPayments
		.filter((payment) => payment.roomId === roomId)
		.sort((a, b) => b.period.localeCompare(a.period));
	const createRentPayment = useRentPaymentsStore(
		(state) => state.createRentPayment,
	);

	const [isAddingPayment, setIsAddingPayment] = useState(false);

	if (!property || !room) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<div className="flex flex-col items-center justify-center py-12 sm:py-16">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 mb-6">
						<DoorOpen className="h-10 w-10 text-muted-foreground" />
					</div>
					<h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
						{t("rooms.notFound")}
					</h1>
					<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
						{t("rooms.notFoundMessage")}
					</p>
					<Button asChild size="lg">
						<Link href={`/dashboard/properties/${id}`}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{t("rooms.backToProperty")}
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const handleCreatePayment = (period: string, amount: number) => {
		createRentPayment(roomId, period, amount);
		setIsAddingPayment(false);
	};

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="space-y-6">
				<Button variant="ghost" asChild className="mb-4 -ml-3">
					<Link href={`/dashboard/properties/${id}`}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("rooms.backToProperty")}
					</Link>
				</Button>

				<div className="flex items-center gap-3 mb-8">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
						<DoorOpen className="h-6 w-6 text-muted-foreground" />
					</div>
					<h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
						{room.name}
					</h1>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-lg">
							{t("rooms.details.title")}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{room.monthlyRent && (
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">
									{t("rooms.details.monthlyRent")}
								</p>
								<p className="text-xl font-semibold">
									{new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
										style: "currency",
										currency: locale === "vi" ? "VND" : "USD",
										minimumFractionDigits: 0,
									}).format(room.monthlyRent)}
								</p>
							</div>
						)}

						{room.notes && (
							<div className="space-y-2 pt-2">
								<p className="text-sm text-muted-foreground">
									{t("rooms.details.notes")}
								</p>
								<p className="text-sm leading-relaxed whitespace-pre-wrap">
									{room.notes}
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Payment Records Section */}
				{!isAddingPayment ? (
					<Button
						onClick={() => setIsAddingPayment(true)}
						size="lg"
						className="w-full"
					>
						<Plus className="mr-2" />
						{t("rentPayments.addButton")}
					</Button>
				) : (
					<Card>
						<CardContent className="pt-6">
							<CreateRentPaymentForm
								onSubmit={handleCreatePayment}
								onCancel={() => setIsAddingPayment(false)}
								defaultAmount={room.monthlyRent}
							/>
						</CardContent>
					</Card>
				)}

				<div className="space-y-4">
					<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
						{t("rentPayments.listTitle")}
					</h2>
					<RentPaymentsList payments={rentPayments} />
				</div>
			</div>
		</div>
	);
}
