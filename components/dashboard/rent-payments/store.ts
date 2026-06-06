import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { PaymentRecord, PaymentStatus } from "./types";

interface RentPaymentsState {
	// Domain data
	rentPayments: PaymentRecord[];

	// Loading state
	isLoading: boolean; // true while any rent payment fetch is in-flight
	loadingRoomIds: string[]; // dedup: prevents duplicate fetches for the same room

	// Actions
	fetchRentPaymentsByRoomId: (roomId: string) => Promise<void>;
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
	clearStore: () => void;
}

export const useRentPaymentsStore = create<RentPaymentsState>()(
	devtools(
		(set, get) => ({
			rentPayments: [],
			isLoading: false,
			loadingRoomIds: [],

			fetchRentPaymentsByRoomId: async (roomId: string) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { loadingRoomIds } = get();
				if (loadingRoomIds.includes(roomId)) return;

				try {
					set((state) => ({
						isLoading: true,
						loadingRoomIds: [...state.loadingRoomIds, roomId],
					}));

					const res = await fetch(`/api/rent-payments?roomId=${roomId}`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch rent payments");
					}

					const data = await res.json();

					set((state) => ({
						rentPayments: [
							...state.rentPayments.filter((p) => p.roomId !== roomId),
							...data,
						],
						isLoading: false,
						loadingRoomIds: state.loadingRoomIds.filter((id) => id !== roomId),
					}));
				} catch (error) {
					console.error("Failed to fetch rent payments:", error);
					set((state) => ({
						isLoading: false,
						loadingRoomIds: state.loadingRoomIds.filter((id) => id !== roomId),
					}));
					throw error;
				}
			},

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

			clearStore: () =>
				set({
					rentPayments: [],
					isLoading: false,
					loadingRoomIds: [],
				}),
		}),
		{ name: "rent-payments" },
	),
);
