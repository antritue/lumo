import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type { PaymentRecord } from "@/components/dashboard/rent-payments/types";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import {
	computeOverviewSnapshot,
	computeOverviewSummary,
} from "./compute-overview-snapshot";
import type { OverviewSnapshot, OverviewSummary } from "./types";

interface OverviewState {
	period: string | null;
	snapshot: OverviewSnapshot | null;
	summary: OverviewSummary | null;
	isOverviewLoading: boolean;
	hasOverviewFetched: boolean;
	isOverviewFetchFailed: boolean;
	togglingPaymentId: string | null;

	fetchOverview: (period: string) => Promise<void>;
	togglePaymentStatus: (payment: PaymentRecord) => Promise<void>;
	clearStore: () => void;
}

function recomputeSnapshot(period: string) {
	const properties = usePropertiesStore.getState().properties;
	const rooms = useRoomsStore.getState().rooms;
	const rentPayments = useRentPaymentsStore.getState().rentPayments;
	const chargesByPaymentId =
		useRentPaymentsStore.getState().serviceChargesByPaymentId;

	const snapshot = computeOverviewSnapshot(
		properties,
		rooms,
		rentPayments,
		chargesByPaymentId,
		period,
	);
	const summary = computeOverviewSummary(snapshot.rooms);

	return { snapshot, summary };
}

export const useOverviewStore = create<OverviewState>()(
	devtools(
		(set, get) => ({
			period: null,
			snapshot: null,
			summary: null,
			isOverviewLoading: false,
			hasOverviewFetched: false,
			isOverviewFetchFailed: false,
			togglingPaymentId: null,

			fetchOverview: async (period) => {
				set({ isOverviewLoading: true, isOverviewFetchFailed: false });

				try {
					const { snapshot, summary } = recomputeSnapshot(period);

					set({
						period,
						snapshot,
						summary,
						isOverviewLoading: false,
						hasOverviewFetched: true,
						isOverviewFetchFailed: false,
					});
				} catch (error) {
					console.error("Failed to compute overview:", error);
					set({
						isOverviewLoading: false,
						isOverviewFetchFailed: true,
					});
					throw error;
				}
			},

			togglePaymentStatus: async (payment) => {
				const { togglingPaymentId } = get();
				if (togglingPaymentId === payment.id) return;

				const newStatus = payment.status === "paid" ? "pending" : "paid";
				set({ togglingPaymentId: payment.id });

				try {
					await useRentPaymentsStore
						.getState()
						.updateRentPayment(
							payment.id,
							payment.period,
							payment.rentAmount,
							newStatus,
						);
				} catch (error) {
					console.error("Failed to toggle payment status:", error);
					set({ togglingPaymentId: null });
					throw error;
				}

				const { period } = get();
				if (period) {
					const { snapshot, summary } = recomputeSnapshot(period);
					set({ snapshot, summary });
				}

				set({ togglingPaymentId: null });
			},

			clearStore: () =>
				set({
					period: null,
					snapshot: null,
					summary: null,
					isOverviewLoading: false,
					hasOverviewFetched: false,
					isOverviewFetchFailed: false,
					togglingPaymentId: null,
				}),
		}),
		{ name: "overview" },
	),
);
