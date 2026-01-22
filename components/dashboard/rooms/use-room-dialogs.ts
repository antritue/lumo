import { useState } from "react";
import type { PaymentRecord } from "@/components/dashboard/rent-payments";

export function useRoomDialogs() {
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

	const openAddPayment = () => {
		setSelectedPayment(null);
		setPaymentDialogMode("add");
	};

	const openEditPayment = (payment: PaymentRecord) => {
		setSelectedPayment(payment);
		setPaymentDialogMode("edit");
	};

	const closePayment = () => {
		setPaymentDialogMode(null);
		setSelectedPayment(null);
	};

	const openDeletePayment = (payment: PaymentRecord) => {
		setSelectedPayment(payment);
		setIsDeletePaymentDialogOpen(true);
	};

	const closeDeletePayment = () => {
		setIsDeletePaymentDialogOpen(false);
		setSelectedPayment(null);
	};

	const openEditRoom = () => {
		setIsEditDialogOpen(true);
	};

	const closeEditRoom = () => {
		setIsEditDialogOpen(false);
	};

	const openDeleteRoom = () => {
		setIsDeleteDialogOpen(true);
	};

	const closeDeleteRoom = () => {
		setIsDeleteDialogOpen(false);
	};

	return {
		// Payment dialog state
		paymentDialogMode,
		selectedPayment,
		isDeletePaymentDialogOpen,
		openAddPayment,
		openEditPayment,
		closePayment,
		openDeletePayment,
		closeDeletePayment,
		// Room dialog state
		isEditDialogOpen,
		isDeleteDialogOpen,
		openEditRoom,
		closeEditRoom,
		openDeleteRoom,
		closeDeleteRoom,
	};
}
