import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { PaymentRecord, PaymentStatus } from "./types";

interface RentPaymentsState {
	// Domain data
	rentPayments: PaymentRecord[];

	// Loading state
	isPaymentsLoading: boolean; // true while any rent payment fetch is in-flight
	loadingRoomIds: string[]; // dedup: prevents duplicate fetches for the same room

	// Actions
	fetchRentPaymentsByRoomId: (roomId: string) => Promise<void>;
	createRentPayment: (
		roomId: string,
		period: string,
		amount: number,
		status?: PaymentStatus,
	) => Promise<void>;
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
			isPaymentsLoading: false,
			loadingRoomIds: [],

			fetchRentPaymentsByRoomId: async (roomId: string) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { loadingRoomIds } = get();
				if (loadingRoomIds.includes(roomId)) return;

				try {
					set((state) => ({
						isPaymentsLoading: true,
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
						isPaymentsLoading: false,
						loadingRoomIds: state.loadingRoomIds.filter((id) => id !== roomId),
					}));
				} catch (error) {
					console.error("Failed to fetch rent payments:", error);
					set((state) => ({
						isPaymentsLoading: false,
						loadingRoomIds: state.loadingRoomIds.filter((id) => id !== roomId),
					}));
					throw error;
				}
			},

			createRentPayment: async (roomId, period, amount, status = "pending") => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch("/api/rent-payments", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ roomId, period, amount, status }),
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to create rent payment");
						console.error("Failed to create rent payment:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						rentPayments: [...state.rentPayments, data],
					}));
				} else {
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
					}));
				}
			},

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
					isPaymentsLoading: false,
					loadingRoomIds: [],
				}),
		}),
		{ name: "rent-payments" },
	),
);
