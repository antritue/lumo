import { useEffect } from "react";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type { PaymentStatus } from "@/components/dashboard/rent-payments/types";

export function useRoomPayments(roomId: string) {
	const allRentPayments = useRentPaymentsStore((state) => state.rentPayments);
	const isPaymentsLoading = useRentPaymentsStore(
		(state) => state.isPaymentsLoading,
	);
	const fetchRentPaymentsByRoomId = useRentPaymentsStore(
		(state) => state.fetchRentPaymentsByRoomId,
	);
	const createRentPayment = useRentPaymentsStore(
		(state) => state.createRentPayment,
	);
	const updateRentPayment = useRentPaymentsStore(
		(state) => state.updateRentPayment,
	);
	const deleteRentPayment = useRentPaymentsStore(
		(state) => state.deleteRentPayment,
	);

	useEffect(() => {
		fetchRentPaymentsByRoomId(roomId);
	}, [roomId, fetchRentPaymentsByRoomId]);

	const rentPayments = allRentPayments
		.filter((payment) => payment.roomId === roomId)
		.sort((a, b) => b.period.localeCompare(a.period));

	const handleSavePayment = async (
		id: string | null,
		period: string,
		amount: number,
		status: PaymentStatus,
	) => {
		if (id) {
			await updateRentPayment(id, period, amount, status);
		} else {
			await createRentPayment(roomId, period, amount, status);
		}
	};

	const handleDeletePayment = async (id: string) => {
		await deleteRentPayment(id);
	};

	return {
		rentPayments,
		handleSavePayment,
		handleDeletePayment,
		isPaymentsLoading,
	};
}
