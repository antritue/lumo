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
	paymentsFetchFailed: boolean; // true when fetchRentPaymentsByRoomId fails

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
	) => Promise<void>;
	deleteRentPayment: (id: string) => Promise<void>;
	clearStore: () => void;
}

export const useRentPaymentsStore = create<RentPaymentsState>()(
	devtools(
		(set, get) => ({
			rentPayments: [],
			isPaymentsLoading: false,
			loadingRoomIds: [],
			paymentsFetchFailed: false,

			fetchRentPaymentsByRoomId: async (roomId: string) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { loadingRoomIds } = get();
				if (loadingRoomIds.includes(roomId)) return;

				try {
					set((state) => ({
						isPaymentsLoading: true,
						loadingRoomIds: [...state.loadingRoomIds, roomId],
						paymentsFetchFailed: false,
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
						paymentsFetchFailed: true,
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

			updateRentPayment: async (id, period, amount, status) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/rent-payments/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ period, amount, status }),
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to update rent payment");
						console.error("Failed to update rent payment:", error);
						throw error;
					}

					const data = await res.json();

					set((state) => ({
						rentPayments: state.rentPayments.map((payment) =>
							payment.id === id ? data : payment,
						),
					}));
				} else {
					set((state) => ({
						rentPayments: state.rentPayments.map((payment) =>
							payment.id === id
								? { ...payment, period, amount, status }
								: payment,
						),
					}));
				}
			},

			deleteRentPayment: async (id) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/rent-payments/${id}`, {
						method: "DELETE",
						credentials: "include",
					});

					if (!res.ok) {
						const error = new Error("Failed to delete rent payment");
						console.error("Failed to delete rent payment:", error);
						throw error;
					}
				}

				set((state) => ({
					rentPayments: state.rentPayments.filter(
						(payment) => payment.id !== id,
					),
				}));
			},

			clearStore: () =>
				set({
					rentPayments: [],
					isPaymentsLoading: false,
					loadingRoomIds: [],
					paymentsFetchFailed: false,
				}),
		}),
		{ name: "rent-payments" },
	),
);
