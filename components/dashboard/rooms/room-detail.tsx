"use client";

import {
	DeleteRentPaymentDialog,
	UpsertRentPaymentDialog,
} from "@/components/dashboard/rent-payments";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { EditRoomDialog } from "./edit-room-dialog";
import { RoomDetailHeader } from "./room-detail-header";
import { RoomDetailsCard } from "./room-details-card";
import { RoomPaymentsSection } from "./room-payments-section";
import { useRoomsStore } from "./store";
import type { Room } from "./types";
import { useRoomDialogs } from "./use-room-dialogs";
import { useRoomPayments } from "./use-room-payments";

interface RoomDetailProps {
	room: Room;
}

export function RoomDetail({ room }: RoomDetailProps) {
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

	const { rentPayments, handleSavePayment, handleDeletePayment } =
		useRoomPayments(room.id);

	const handleSaveRoom = (
		id: string,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => {
		updateRoom(id, name, monthlyRent, notes);
		closeEditRoom();
	};

	const handleConfirmDeleteRoom = (id: string) => {
		deleteRoom(id);
		closeDeleteRoom();
		// Redirect to properties page after delete
		window.location.href = "/dashboard/properties";
	};

	const handleConfirmDeletePayment = (id: string) => {
		handleDeletePayment(id);
		closeDeletePayment();
	};

	const handleSaveAndClose = (
		id: string | null,
		period: string,
		amount: number,
	) => {
		handleSavePayment(id, period, amount);
		closePayment();
	};

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="space-y-6">
				<RoomDetailHeader
					room={room}
					onEdit={openEditRoom}
					onDelete={openDeleteRoom}
				/>

				<RoomDetailsCard room={room} />

				<RoomPaymentsSection
					payments={rentPayments}
					onAdd={openAddPayment}
					onEdit={openEditPayment}
					onDelete={openDeletePayment}
				/>

				{/* Dialogs */}
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

				<EditRoomDialog
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
			</div>
		</div>
	);
}
