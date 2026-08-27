import type { Property } from "@/components/dashboard/properties/types";
import type {
	PaymentRecord,
	ServiceCharge,
} from "@/components/dashboard/rent-payments/types";
import type { Room } from "@/components/dashboard/rooms/types";
import type {
	OverviewProperty,
	OverviewRoom,
	OverviewSnapshot,
	OverviewSummary,
} from "./types";

export function computeOverviewSnapshot(
	properties: Property[],
	rooms: Room[],
	payments: PaymentRecord[],
	chargesByPaymentId: Record<string, ServiceCharge[]>,
	period: string,
): OverviewSnapshot {
	const paymentByRoomId = new Map(
		payments.filter((p) => p.period === period).map((p) => [p.roomId, p]),
	);

	const overviewRooms: OverviewRoom[] = rooms.map((room) => {
		const payment = paymentByRoomId.get(room.id) ?? null;
		const charges = payment ? (chargesByPaymentId[payment.id] ?? []) : [];
		const total = payment
			? payment.rentAmount +
				charges.reduce((sum, charge) => sum + charge.total, 0)
			: 0;

		return {
			id: room.id,
			propertyId: room.propertyId,
			name: room.name,
			monthlyRent: room.monthlyRent,
			payment,
			charges,
			total,
		};
	});

	const overviewProperties: OverviewProperty[] = properties
		.map((property) => {
			const propertyRooms = overviewRooms.filter(
				(room) => room.propertyId === property.id,
			);
			return {
				id: property.id,
				name: property.name,
				rooms: propertyRooms,
				paidCount: propertyRooms.filter(
					(room) => room.payment?.status === "paid",
				).length,
			};
		})
		.filter((property) => property.rooms.length > 0);

	return {
		period,
		properties: overviewProperties,
		rooms: overviewRooms,
	};
}

export function computeOverviewSummary(rooms: OverviewRoom[]): OverviewSummary {
	let paidCount = 0;
	let pendingCount = 0;
	let collected = 0;
	let pending = 0;
	let notRecordedCount = 0;

	for (const room of rooms) {
		if (!room.payment) {
			notRecordedCount += 1;
		} else if (room.payment.status === "paid") {
			paidCount += 1;
			collected += room.total;
		} else {
			pendingCount += 1;
			pending += room.total;
		}
	}

	return {
		totalRooms: rooms.length,
		paidCount,
		pendingCount,
		collected,
		pending,
		notRecordedCount,
	};
}
