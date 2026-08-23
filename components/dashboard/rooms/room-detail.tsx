"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { DeleteRentPaymentDialog } from "@/components/dashboard/rent-payments/delete-rent-payment-dialog";
import type {
	PaymentRecord,
	PaymentStatus,
} from "@/components/dashboard/rent-payments/types";
import { UpsertRentPaymentDialog } from "@/components/dashboard/rent-payments/upsert-rent-payment-dialog";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { RoomDetailHeader } from "./room-detail-header";
import { RoomInfo } from "./room-info";
import { RoomPaymentsSection } from "./room-payments-section";
import { RoomServicesSection } from "./room-services-section";
import { useRoomsStore } from "./store";
import type { Room } from "./types";
import { UpsertRoomDialog } from "./upsert-room-dialog";
import { useRoomDialogs } from "./use-room-dialogs";
import { useRoomPayments } from "./use-room-payments";

interface RoomDetailProps {
	room: Room;
}

export function RoomDetail({ room }: RoomDetailProps) {
	const router = useRouter();
	const updateRoom = useRoomsStore((state) => state.updateRoom);
	const deleteRoom = useRoomsStore((state) => state.deleteRoom);

	const {
		paymentDialogMode,
		selectedPayment,
		isDeletePaymentDialogOpen,
		openAddPayment,
		openEditPayment,
		closePayment,
		openDeletePayment,
		closeDeletePayment,
		isEditDialogOpen,
		isDeleteDialogOpen,
		openEditRoom,
		closeEditRoom,
		openDeleteRoom,
		closeDeleteRoom,
	} = useRoomDialogs();

	const t = useTranslations("app.rentPayments");

	const {
		rentPayments,
		handleSavePayment,
		handleDeletePayment,
		handleToggleStatus,
		togglingPaymentId,
		toggleStatusError,
		dismissToggleStatusError,
		isPaymentsLoading,
		isPaymentsFetchFailed,
		retryFetchPayments,
		serviceChargesByPeriod,
		chargesInitialized,
		updateServiceCharges,
		defaultCharges,
	} = useRoomPayments(room.id, room.propertyId);

	const handleSaveRoom = async (
		id: string | null,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => {
		if (id) {
			await updateRoom(id, name, monthlyRent, notes);
		}
		closeEditRoom();
	};

	const handleConfirmDeleteRoom = async (id: string) => {
		await deleteRoom(id);
		closeDeleteRoom();
		router.push("/dashboard/properties");
	};

	const handleConfirmDeletePayment = async (id: string) => {
		await handleDeletePayment(id);
		closeDeletePayment();
	};

	const handleTogglePaymentStatus = useCallback(
		(payment: PaymentRecord) => {
			handleToggleStatus(payment.id);
		},
		[handleToggleStatus],
	);

	const handleSaveAndClose = async (
		id: string | null,
		period: string,
		rentAmount: number,
		status: PaymentStatus,
	): Promise<string> => {
		const paymentId = await handleSavePayment(id, period, rentAmount, status);
		closePayment();
		return paymentId;
	};

	const initialServiceCharges =
		paymentDialogMode === "edit" && selectedPayment
			? (serviceChargesByPeriod[selectedPayment.period] ?? defaultCharges)
			: defaultCharges;

	return (
		<div className="space-y-8">
			<RoomDetailHeader
				room={room}
				onEdit={openEditRoom}
				onDelete={openDeleteRoom}
			/>

			<RoomInfo room={room} />

			<RoomServicesSection roomId={room.id} propertyId={room.propertyId} />

			<RoomPaymentsSection
				payments={rentPayments}
				onAdd={openAddPayment}
				onEdit={openEditPayment}
				onDelete={openDeletePayment}
				onToggleStatus={handleTogglePaymentStatus}
				togglingPaymentId={togglingPaymentId}
				isPaymentsLoading={isPaymentsLoading}
				isPaymentsFetchFailed={isPaymentsFetchFailed}
				onRetryPayments={retryFetchPayments}
				serviceChargesByPeriod={serviceChargesByPeriod}
				isChargesLoaded={chargesInitialized}
			/>

			{paymentDialogMode && (
				<UpsertRentPaymentDialog
					mode={paymentDialogMode}
					payment={selectedPayment ?? undefined}
					open={true}
					onOpenChange={(open) => {
						if (!open) {
							closePayment();
						}
					}}
					onSave={handleSaveAndClose}
					defaultAmount={room.monthlyRent}
					existingPayments={rentPayments}
					initialServiceCharges={initialServiceCharges}
					onSaveServiceCharges={updateServiceCharges}
				/>
			)}

			{selectedPayment && (
				<DeleteRentPaymentDialog
					payment={selectedPayment}
					open={isDeletePaymentDialogOpen}
					onOpenChange={closeDeletePayment}
					onConfirm={handleConfirmDeletePayment}
				/>
			)}

			<UpsertRoomDialog
				mode="edit"
				room={room}
				open={isEditDialogOpen}
				onOpenChange={closeEditRoom}
				onSave={handleSaveRoom}
			/>

			<DeleteRoomDialog
				room={room}
				open={isDeleteDialogOpen}
				onOpenChange={closeDeleteRoom}
				onDelete={handleConfirmDeleteRoom}
			/>

			<ErrorDialog
				open={toggleStatusError}
				onOpenChange={dismissToggleStatusError}
				title={t("errors.toggleStatus.title")}
				description={t("errors.toggleStatus.description")}
			/>
		</div>
	);
}
