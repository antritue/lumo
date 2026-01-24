import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PaymentRecord, PaymentStatus } from "./types";

interface RentPaymentsState {
	// Domain data
	rentPayments: PaymentRecord[];

	// Actions
	createRentPayment: (
		roomId: string,
		period: string,
		amount: number,
		status?: PaymentStatus,
	) => void;
	updateRentPayment: (
		id: string,
		period: string,
		amount: number,
		status: PaymentStatus,
	) => void;
	deleteRentPayment: (id: string) => void;
}

export const useRentPaymentsStore = create<RentPaymentsState>()(
	devtools(
		(set, _get) => ({
			rentPayments: [],

			createRentPayment: (roomId, period, amount, status = "pending") =>
				set((state) => ({
					rentPayments: [
						...state.rentPayments,
						{
							id: crypto.randomUUID(),
							roomId,
							period,
							amount,
							status,
						},
					],
				})),

			updateRentPayment: (id, period, amount, status) =>
				set((state) => ({
					rentPayments: state.rentPayments.map((payment) =>
						payment.id === id
							? { ...payment, period, amount, status }
							: payment,
					),
				})),

			deleteRentPayment: (id) =>
				set((state) => ({
					rentPayments: state.rentPayments.filter(
						(payment) => payment.id !== id,
					),
				})),
		}),
		{ name: "rent-payments" },
	),
);
