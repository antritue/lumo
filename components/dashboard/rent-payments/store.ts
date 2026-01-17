import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PaymentRecord } from "./types";

interface RentPaymentsState {
	// Domain data
	rentPayments: PaymentRecord[];

	// Actions
	createRentPayment: (roomId: string, period: string, amount: number) => void;
}

export const useRentPaymentsStore = create<RentPaymentsState>()(
	devtools(
		(set, _get) => ({
			rentPayments: [],

			createRentPayment: (roomId, period, amount) =>
				set((state) => ({
					rentPayments: [
						...state.rentPayments,
						{
							id: crypto.randomUUID(),
							roomId,
							period,
							amount,
						},
					],
				})),
		}),
		{ name: "rent-payments" },
	),
);
