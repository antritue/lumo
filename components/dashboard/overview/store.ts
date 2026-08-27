import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type {
	PaymentRecord,
	PaymentStatus,
} from "@/components/dashboard/rent-payments/types";
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
	fetchingPeriod: string | null;
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
			fetchingPeriod: null,
			togglingPaymentId: null,

			fetchOverview: async (period: string) => {
				const user = useAuthStore.getState().user;
				const { fetchingPeriod } = get();
				if (fetchingPeriod === period) return;

				if (!user) {
					const { snapshot, summary } = recomputeSnapshot(period);
					set({
						period,
						snapshot,
						summary,
						isOverviewLoading: false,
						hasOverviewFetched: true,
						isOverviewFetchFailed: false,
					});
					return;
				}

				try {
					set({
						isOverviewLoading: true,
						fetchingPeriod: period,
						isOverviewFetchFailed: false,
					});

					const res = await fetch(`/api/overview?period=${period}`, {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch overview");
					}

					const data: OverviewSnapshot = await res.json();
					const summary = computeOverviewSummary(data.rooms);

					const enrichedProperties = data.properties.map((prop) => {
						const propertyRooms = data.rooms.filter(
							(room) => room.propertyId === prop.id,
						);
						return {
							...prop,
							rooms: propertyRooms,
							paidCount: propertyRooms.filter(
								(room) => room.payment?.status === "paid",
							).length,
						};
					});

					set({
						period,
						snapshot: { ...data, properties: enrichedProperties },
						summary,
						isOverviewLoading: false,
						fetchingPeriod: null,
						hasOverviewFetched: true,
					});
				} catch (error) {
					console.error("Failed to fetch overview:", error);
					set({
						isOverviewLoading: false,
						fetchingPeriod: null,
						isOverviewFetchFailed: true,
					});
					throw error;
				}
			},

			togglePaymentStatus: async (payment: PaymentRecord) => {
				const { togglingPaymentId } = get();
				if (togglingPaymentId === payment.id) return;

				const newStatus: PaymentStatus =
					payment.status === "paid" ? "pending" : "paid";
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

				const { period, snapshot } = get();
				if (period && snapshot) {
					const updatedRooms = snapshot.rooms.map((room) =>
						room.payment?.id === payment.id
							? { ...room, payment: { ...room.payment, status: newStatus } }
							: room,
					);
					const updatedProperties = snapshot.properties.map((prop) => ({
						...prop,
						rooms: prop.rooms.map((room) =>
							room.payment?.id === payment.id
								? { ...room, payment: { ...room.payment, status: newStatus } }
								: room,
						),
						paidCount: prop.rooms.filter(
							(room) =>
								(room.payment?.id === payment.id
									? newStatus
									: room.payment?.status) === "paid",
						).length,
					}));
					const summary = computeOverviewSummary(updatedRooms);
					set({
						snapshot: {
							...snapshot,
							rooms: updatedRooms,
							properties: updatedProperties,
						},
						summary,
					});
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
					fetchingPeriod: null,
					togglingPaymentId: null,
				}),
		}),
		{ name: "overview" },
	),
);
