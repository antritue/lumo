"use client";

import { ArrowLeft, DoorOpen, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { use, useState } from "react";
import type { PaymentRecord } from "@/components/dashboard/rent-payments";
import {
	DeleteRentPaymentDialog,
	RentPaymentsList,
	UpsertRentPaymentDialog,
	useRentPaymentsStore,
} from "@/components/dashboard/rent-payments";
import { DeleteRoomDialog, EditRoomDialog } from "@/components/dashboard/rooms";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoomDetailPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const { roomId } = use(params);
	const t = useTranslations("app");
	const locale = useLocale();

	const room = useRoomsStore((state) => state.getRoomById(roomId));

	const allRentPayments = useRentPaymentsStore((state) => state.rentPayments);
	const rentPayments = allRentPayments
		.filter((payment) => payment.roomId === roomId)
		.sort((a, b) => b.period.localeCompare(a.period));
	const createRentPayment = useRentPaymentsStore(
		(state) => state.createRentPayment,
	);
	const updateRentPayment = useRentPaymentsStore(
		(state) => state.updateRentPayment,
	);
	const deleteRentPayment = useRentPaymentsStore(
		(state) => state.deleteRentPayment,
	);
	const updateRoom = useRoomsStore((state) => state.updateRoom);
	const deleteRoom = useRoomsStore((state) => state.deleteRoom);

	const [paymentDialogMode, setPaymentDialogMode] = useState<
		"add" | "edit" | null
	>(null);
	const [isDeletePaymentDialogOpen, setIsDeletePaymentDialogOpen] =
		useState(false);
	const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
		null,
	);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	if (!room) {
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
						<Link href="/dashboard/properties">
							<ArrowLeft className="mr-2 h-4 w-4" />
							{t("properties.backToProperties")}
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	const handleOpenAddPayment = () => {
		setSelectedPayment(null);
		setPaymentDialogMode("add");
	};

	const handleEditPayment = (payment: PaymentRecord) => {
		setSelectedPayment(payment);
		setPaymentDialogMode("edit");
	};

	const handleSavePayment = (
		id: string | null,
		period: string,
		amount: number,
	) => {
		if (id) {
			updateRentPayment(id, period, amount);
		} else {
			createRentPayment(roomId, period, amount);
		}
		setPaymentDialogMode(null);
		setSelectedPayment(null);
	};

	const handleDeletePayment = (payment: PaymentRecord) => {
		setSelectedPayment(payment);
		setIsDeletePaymentDialogOpen(true);
	};

	const handleConfirmDeletePayment = (id: string) => {
		deleteRentPayment(id);
		setIsDeletePaymentDialogOpen(false);
		setSelectedPayment(null);
	};

	const handleSave = (
		id: string,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => {
		updateRoom(id, name, monthlyRent, notes);
		setIsEditDialogOpen(false);
	};

	const handleConfirmDelete = (id: string) => {
		deleteRoom(id);
		setIsDeleteDialogOpen(false);
		// Redirect to properties page after delete
		window.location.href = "/dashboard/properties";
	};

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="space-y-6">
				<Button variant="ghost" asChild className="mb-4 -ml-3">
					<Link href="/dashboard/properties">
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("properties.backToProperties")}
					</Link>
				</Button>

				<div className="space-y-2">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3 flex-1 min-w-0">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
								<DoorOpen className="h-6 w-6 text-muted-foreground" />
							</div>
							<h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
								{room.name}
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsEditDialogOpen(true)}
								aria-label={t("rooms.edit")}
								className="h-9 w-9"
							>
								<Pencil className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsDeleteDialogOpen(true)}
								aria-label={t("rooms.delete")}
								className="h-9 w-9 text-muted-foreground hover:text-destructive"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
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
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
							{t("rentPayments.listTitle")}
						</h2>
						<Button onClick={handleOpenAddPayment} variant="outline" size="sm">
							<Plus className="mr-2 h-4 w-4" />
							{t("rentPayments.addButton")}
						</Button>
					</div>

					<RentPaymentsList
						payments={rentPayments}
						onEdit={handleEditPayment}
						onDelete={handleDeletePayment}
					/>
				</div>

				{/* Dialogs */}
				{paymentDialogMode && (
					<UpsertRentPaymentDialog
						mode={paymentDialogMode}
						payment={selectedPayment ?? undefined}
						open={true}
						onOpenChange={(open) => {
							if (!open) {
								setPaymentDialogMode(null);
								setSelectedPayment(null);
							}
						}}
						onSave={handleSavePayment}
						defaultAmount={room.monthlyRent}
					/>
				)}

				{selectedPayment && (
					<DeleteRentPaymentDialog
						payment={selectedPayment}
						open={isDeletePaymentDialogOpen}
						onOpenChange={setIsDeletePaymentDialogOpen}
						onConfirm={handleConfirmDeletePayment}
					/>
				)}

				<EditRoomDialog
					room={room}
					open={isEditDialogOpen}
					onOpenChange={setIsEditDialogOpen}
					onSave={handleSave}
				/>

				<DeleteRoomDialog
					room={room}
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onDelete={handleConfirmDelete}
				/>
			</div>
		</div>
	);
}
