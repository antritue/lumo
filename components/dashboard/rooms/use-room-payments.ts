import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export function useRoomPayments(roomId: string, propertyId?: string) {
	const allRentPayments = useRentPaymentsStore((state) => state.rentPayments);
	const isPaymentsLoading = useRentPaymentsStore(
		(state) => state.isPaymentsLoading,
	);
	const isPaymentsFetchFailed = useRentPaymentsStore(
		(state) => state.isPaymentsFetchFailed,
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
	const saveRentPaymentCharges = useRentPaymentsStore(
		(state) => state.saveRentPaymentCharges,
	);
	const fetchRentPaymentChargesByRoomId = useRentPaymentsStore(
		(state) => state.fetchRentPaymentChargesByRoomId,
	);

	const roomServices = useRoomServicesStore(
		useShallow((state) => state.roomServicesByRoomId[roomId] ?? []),
	);
	const fetchRoomServices = useRoomServicesStore(
		(state) => state.fetchRoomServices,
	);

	const [serviceChargesByPeriod, setServiceChargesByPeriod] = useState<
		Record<string, ServiceCharge[]>
	>({});
	const chargesInitialized = useRef(false);

	useEffect(() => {
		fetchRentPaymentsByRoomId(roomId);
	}, [roomId, fetchRentPaymentsByRoomId]);

	useEffect(() => {
		if (propertyId) {
			fetchRoomServices(roomId, propertyId);
		}
	}, [roomId, propertyId, fetchRoomServices]);

	const rentPayments = useMemo(
		() =>
			allRentPayments
				.filter((payment) => payment.roomId === roomId)
				.sort((a, b) => b.period.localeCompare(a.period)),
		[allRentPayments, roomId],
	);

	// Load persisted charges on initial mount only
	useEffect(() => {
		if (roomServices.length === 0) return;
		if (rentPayments.length === 0) return;
		if (chargesInitialized.current) return;
		chargesInitialized.current = true;

		setServiceChargesByPeriod((prev) => {
			const next = { ...prev };
			for (const payment of rentPayments) {
				if (!next[payment.period]) {
					next[payment.period] = generateChargesFromServices(roomServices);
				}
			}
			return next;
		});

		const loadCharges = async () => {
			try {
				const persisted = await fetchRentPaymentChargesByRoomId(roomId);

				setServiceChargesByPeriod((prev) => {
					const next = { ...prev };
					const paymentIdToPeriod: Record<string, string> = {};
					for (const payment of rentPayments) {
						paymentIdToPeriod[payment.id] = payment.period;
					}

					for (const [paymentId, charges] of Object.entries(persisted)) {
						const period = paymentIdToPeriod[paymentId];
						if (period) {
							next[period] = charges;
						}
					}

					return next;
				});
			} catch (error) {
				console.error("Failed to load persisted charges:", error);
			}
		};

		loadCharges();
	}, [roomServices, rentPayments, roomId, fetchRentPaymentChargesByRoomId]);

	const retryFetchPayments = useCallback(() => {
		fetchRentPaymentsByRoomId(roomId);
	}, [fetchRentPaymentsByRoomId, roomId]);

	const handleSavePayment = async (
		id: string | null,
		period: string,
		rentAmount: number,
		status: PaymentStatus,
	): Promise<string> => {
		if (id) {
			return await updateRentPayment(id, period, rentAmount, status);
		}
		return await createRentPayment(roomId, period, rentAmount, status);
	};

	const handleDeletePayment = async (id: string) => {
		await deleteRentPayment(id);
	};

	const updateServiceCharges = useCallback(
		async (period: string, charges: ServiceCharge[], paymentId: string) => {
			setServiceChargesByPeriod((prev) => ({
				...prev,
				[period]: charges,
			}));
			await saveRentPaymentCharges(paymentId, charges);
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
		handleDeletePayment,
		isPaymentsLoading,
		isPaymentsFetchFailed,
		retryFetchPayments,
		serviceChargesByPeriod,
		updateServiceCharges,
		defaultCharges,
	};
}
