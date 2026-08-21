import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { PaymentRecord, PaymentStatus, ServiceCharge } from "./types";

interface RentPaymentsState {
	rentPayments: PaymentRecord[];
	serviceChargesByPaymentId: Record<string, ServiceCharge[]>;

	isPaymentsLoading: boolean;
	isPaymentsFetchFailed: boolean;
	fetchingRoomId: string | null; // dedup: prevents duplicate fetches for the same room
	fetchingRoomChargesId: string | null; // dedup: prevents duplicate charge fetches for the same room

	// Actions
	fetchRentPaymentsByRoomId: (roomId: string) => Promise<void>;
	createRentPayment: (
		roomId: string,
		period: string,
		rentAmount: number,
		status?: PaymentStatus,
	) => Promise<string>;
	updateRentPayment: (
		id: string,
		period: string,
		rentAmount: number,
		status: PaymentStatus,
	) => Promise<string>;
	deleteRentPayment: (id: string) => Promise<void>;
	saveRentPaymentCharges: (
		paymentId: string,
		charges: ServiceCharge[],
	) => Promise<void>;
	fetchRentPaymentChargesByRoomId: (
		roomId: string,
	) => Promise<Record<string, ServiceCharge[]>>;
	clearStore: () => void;
}

export const useRentPaymentsStore = create<RentPaymentsState>()(
	devtools(
		(set, get) => ({
			rentPayments: [],
			serviceChargesByPaymentId: {},
			isPaymentsLoading: false,
			fetchingRoomId: null,
			isPaymentsFetchFailed: false,
			fetchingRoomChargesId: null,

			fetchRentPaymentsByRoomId: async (roomId: string) => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { fetchingRoomId } = get();
				if (fetchingRoomId === roomId) return;

				try {
					set({
						isPaymentsLoading: true,
						fetchingRoomId: roomId,
						isPaymentsFetchFailed: false,
					});

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
						fetchingRoomId: null,
					}));
				} catch (error) {
					console.error("Failed to fetch rent payments:", error);
					set({
						isPaymentsLoading: false,
						fetchingRoomId: null,
						isPaymentsFetchFailed: true,
					});
					throw error;
				}
			},

			createRentPayment: async (
				roomId,
				period,
				rentAmount,
				status = "pending",
			) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch("/api/rent-payments", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							roomId,
							period,
							rentAmount,
							status,
						}),
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

					return data.id;
				} else {
					const id = crypto.randomUUID();
					set((state) => ({
						rentPayments: [
							...state.rentPayments,
							{
								id,
								roomId,
								period,
								rentAmount,
								status,
							},
						],
					}));
					return id;
				}
			},

			updateRentPayment: async (id, period, rentAmount, status) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const res = await fetch(`/api/rent-payments/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							period,
							rentAmount,
							status,
						}),
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

					return data.id;
				} else {
					set((state) => ({
						rentPayments: state.rentPayments.map((payment) =>
							payment.id === id
								? { ...payment, period, rentAmount, status }
								: payment,
						),
					}));
					return id;
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

			saveRentPaymentCharges: async (paymentId, charges) => {
				const user = useAuthStore.getState().user;

				if (user) {
					const payload = charges.map(({ total: _total, ...rest }) => rest);

					const res = await fetch(
						`/api/rent-payments/${paymentId}/service-charges`,
						{
							method: "PATCH",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(payload),
							credentials: "include",
						},
					);

					if (!res.ok) {
						const error = new Error("Failed to save rent payment charges");
						console.error("Failed to save rent payment charges:", error);
						throw error;
					}
				} else {
					set((state) => ({
						serviceChargesByPaymentId: {
							...state.serviceChargesByPaymentId,
							[paymentId]: charges,
						},
					}));
				}
			},

			fetchRentPaymentChargesByRoomId: async (roomId) => {
				const user = useAuthStore.getState().user;
				if (!user) return {};

				const { fetchingRoomChargesId } = get();
				if (fetchingRoomChargesId === roomId) return {};

				try {
					set({ fetchingRoomChargesId: roomId });

					const res = await fetch(`/api/rooms/${roomId}/rent-payment-charges`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch rent payment charges");
					}

					const data: Record<string, ServiceCharge[]> = await res.json();
					set({ fetchingRoomChargesId: null });
					return data;
				} catch (error) {
					console.error("Failed to fetch rent payment charges:", error);
					set({ fetchingRoomChargesId: null });
					throw error;
				}
			},

			clearStore: () =>
				set({
					rentPayments: [],
					serviceChargesByPaymentId: {},
					isPaymentsLoading: false,
					fetchingRoomId: null,
					isPaymentsFetchFailed: false,
					fetchingRoomChargesId: null,
				}),
		}),
		{ name: "rent-payments" },
	),
);
