import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type {
	PaymentStatus,
	ServiceCharge,
} from "@/components/dashboard/rent-payments/types";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import type { RoomService } from "@/components/dashboard/rooms/types";

function generateChargesFromServices(services: RoomService[]): ServiceCharge[] {
	return services.map((s) => ({
		serviceId: s.serviceId,
		serviceName: s.serviceName,
		pricingType: s.pricingType,
		unitLabel: s.unitLabel,
		unitPrice: s.unitPrice,
		flatAmount: s.pricingType === "flat" ? s.flatAmount : null,
		usage: s.pricingType === "variable" ? 0 : null,
		total: s.pricingType === "flat" ? (s.flatAmount ?? 0) : 0,
	}));
}

type ChargesState = {
	roomId: string;
	status: "initial" | "loading" | "done";
	byPeriod: Record<string, ServiceCharge[]>;
};

export function useRoomPayments(roomId: string) {
	const {
		rentPayments: allRentPayments,
		isPaymentsLoading,
		isPaymentsFetchFailed,
		fetchRentPaymentsByRoomId,
		createRentPayment,
		updateRentPayment,
		deleteRentPayment,
		saveRentPaymentCharges,
		fetchRentPaymentChargesByRoomId,
	} = useRentPaymentsStore(
		useShallow((state) => ({
			rentPayments: state.rentPayments,
			isPaymentsLoading: state.isPaymentsLoading,
			isPaymentsFetchFailed: state.isPaymentsFetchFailed,
			fetchRentPaymentsByRoomId: state.fetchRentPaymentsByRoomId,
			createRentPayment: state.createRentPayment,
			updateRentPayment: state.updateRentPayment,
			deleteRentPayment: state.deleteRentPayment,
			saveRentPaymentCharges: state.saveRentPaymentCharges,
			fetchRentPaymentChargesByRoomId: state.fetchRentPaymentChargesByRoomId,
		})),
	);

	const roomServices = useRoomServicesStore(
		useShallow((state) => state.roomServicesByRoomId[roomId] ?? []),
	);

	const [togglingPaymentId, setTogglingPaymentId] = useState<string | null>(
		null,
	);
	const [toggleStatusError, setToggleStatusError] = useState(false);
	const dismissToggleStatusError = useCallback(
		() => setToggleStatusError(false),
		[],
	);
	const [charges, setCharges] = useState<ChargesState>({
		roomId,
		status: "initial",
		byPeriod: {},
	});

	useEffect(() => {
		fetchRentPaymentsByRoomId(roomId);
	}, [roomId, fetchRentPaymentsByRoomId]);

	const rentPayments = useMemo(
		() =>
			allRentPayments
				.filter((payment) => payment.roomId === roomId)
				.sort((a, b) => b.period.localeCompare(a.period)),
		[allRentPayments, roomId],
	);

	// Load persisted charges once per room, once its rent payments exist
	useEffect(() => {
		if (charges.roomId !== roomId) {
			setCharges({ roomId, status: "initial", byPeriod: {} });
			return;
		}
		if (charges.status !== "initial") return;

		// Read from the store — the rendered isPaymentsLoading can be stale
		if (useRentPaymentsStore.getState().isPaymentsLoading) return;

		if (rentPayments.length === 0) {
			setCharges((current) => ({ ...current, status: "done" }));
			return;
		}

		setCharges((current) => ({ ...current, status: "loading" }));

		const periodByPaymentId = Object.fromEntries(
			rentPayments.map((payment) => [payment.id, payment.period]),
		);

		const applyPersisted = (persisted: Record<string, ServiceCharge[]>) => {
			setCharges((current) => {
				if (current.roomId !== roomId) return current;
				const byPeriod = { ...current.byPeriod };
				for (const [paymentId, chargeList] of Object.entries(persisted)) {
					const period = periodByPaymentId[paymentId];
					if (period) byPeriod[period] = chargeList;
				}
				return { ...current, byPeriod };
			});
		};

		const loadCharges = async () => {
			try {
				applyPersisted(await fetchRentPaymentChargesByRoomId(roomId));
			} catch (error) {
				console.error("Failed to load persisted charges:", error);
			} finally {
				setCharges((current) =>
					current.roomId === roomId ? { ...current, status: "done" } : current,
				);
			}
		};

		loadCharges();
	}, [roomId, rentPayments, charges, fetchRentPaymentChargesByRoomId]);

	const retryFetchPayments = useCallback(() => {
		fetchRentPaymentsByRoomId(roomId);
	}, [fetchRentPaymentsByRoomId, roomId]);

	const handleSavePayment = (
		id: string | null,
		period: string,
		rentAmount: number,
		status: PaymentStatus,
	): Promise<string> =>
		id
			? updateRentPayment(id, period, rentAmount, status)
			: createRentPayment(roomId, period, rentAmount, status);

	const handleToggleStatus = useCallback(
		async (id: string) => {
			setTogglingPaymentId(id);
			setToggleStatusError(false);
			try {
				const payment = useRentPaymentsStore
					.getState()
					.rentPayments.find((p) => p.id === id);
				if (!payment) return;
				await updateRentPayment(
					id,
					payment.period,
					payment.rentAmount,
					payment.status === "paid" ? "pending" : "paid",
				);
			} catch {
				setToggleStatusError(true);
			} finally {
				setTogglingPaymentId(null);
			}
		},
		[updateRentPayment],
	);

	const updateServiceCharges = useCallback(
		async (period: string, chargeList: ServiceCharge[], paymentId: string) => {
			setCharges((current) => ({
				...current,
				byPeriod: { ...current.byPeriod, [period]: chargeList },
			}));
			await saveRentPaymentCharges(paymentId, chargeList);
		},
		[saveRentPaymentCharges],
	);

	const defaultCharges = useMemo(
		() => generateChargesFromServices(roomServices),
		[roomServices],
	);

	return {
		rentPayments,
		handleSavePayment,
		handleDeletePayment: deleteRentPayment,
		handleToggleStatus,
		togglingPaymentId,
		toggleStatusError,
		dismissToggleStatusError,
		isPaymentsLoading,
		isPaymentsFetchFailed,
		retryFetchPayments,
		serviceChargesByPeriod: charges.byPeriod,
		chargesInitialized: charges.status === "done",
		updateServiceCharges,
		defaultCharges,
	};
}
