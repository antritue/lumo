import { describe, expect, it } from "vitest";
import type { Property } from "@/components/dashboard/properties/types";
import type {
	PaymentRecord,
	ServiceCharge,
} from "@/components/dashboard/rent-payments/types";
import type { Room } from "@/components/dashboard/rooms/types";
import {
	computeOverviewSnapshot,
	computeOverviewSummary,
} from "./compute-overview-snapshot";
import type { OverviewRoom } from "./types";

const mockProperty = (overrides: Partial<Property> = {}): Property => ({
	id: "prop-1",
	userId: "user-1",
	name: "Sunset Villa",
	...overrides,
});

const mockRoom = (overrides: Partial<Room> = {}): Room => ({
	id: "room-1",
	propertyId: "prop-1",
	name: "Room 101",
	monthlyRent: 800,
	notes: null,
	...overrides,
});

const mockPayment = (
	overrides: Partial<PaymentRecord> = {},
): PaymentRecord => ({
	id: "pay-1",
	roomId: "room-1",
	period: "2026-08",
	rentAmount: 800,
	status: "pending",
	...overrides,
});

const mockCharge = (overrides: Partial<ServiceCharge> = {}): ServiceCharge => ({
	serviceId: "svc-1",
	serviceName: "Parking",
	pricingType: "flat",
	unitLabel: null,
	unitPrice: null,
	flatAmount: 50,
	usage: null,
	total: 50,
	...overrides,
});

const mockOverviewRoom = (
	overrides: Partial<OverviewRoom> = {},
): OverviewRoom => ({
	id: "room-1",
	propertyId: "prop-1",
	name: "Room 101",
	monthlyRent: 800,
	payment: null,
	charges: [],
	total: 0,
	...overrides,
});

describe("computeOverviewSnapshot", () => {
	it("returns an empty snapshot when there are no rooms", () => {
		const snapshot = computeOverviewSnapshot([], [], [], {}, "2026-08");

		expect(snapshot).toEqual({
			period: "2026-08",
			properties: [],
			rooms: [],
		});
	});

	it("matches each room to its payment for the selected period", () => {
		const rooms = [mockRoom({ id: "room-1" }), mockRoom({ id: "room-2" })];
		const payments = [
			mockPayment({
				id: "pay-1",
				roomId: "room-1",
				period: "2026-08",
				status: "paid",
			}),
			mockPayment({
				id: "pay-2",
				roomId: "room-2",
				period: "2026-07",
				status: "paid",
			}),
		];

		const snapshot = computeOverviewSnapshot(
			[mockProperty()],
			rooms,
			payments,
			{},
			"2026-08",
		);

		expect(snapshot.rooms[0].payment?.id).toBe("pay-1");
		expect(snapshot.rooms[1].payment).toBeNull();
	});

	it("sums rent and charges for recorded rooms", () => {
		const rooms = [mockRoom({ monthlyRent: 800 })];
		const payments = [
			mockPayment({ id: "pay-1", status: "paid", rentAmount: 800 }),
		];
		const charges = {
			"pay-1": [mockCharge({ total: 50 }), mockCharge({ total: 25 })],
		};

		const snapshot = computeOverviewSnapshot(
			[mockProperty()],
			rooms,
			payments,
			charges,
			"2026-08",
		);

		expect(snapshot.rooms[0].total).toBe(875);
	});

	it("groups rooms under their property preserving order", () => {
		const properties = [
			mockProperty({ id: "prop-1", name: "Sunset Villa" }),
			mockProperty({ id: "prop-2", name: "Ocean View" }),
		];
		const rooms = [
			mockRoom({ propertyId: "prop-1", name: "Room 101" }),
			mockRoom({ id: "room-2", propertyId: "prop-2", name: "Room A" }),
		];

		const snapshot = computeOverviewSnapshot(
			properties,
			rooms,
			[],
			{},
			"2026-08",
		);

		expect(snapshot.properties).toHaveLength(2);
		expect(snapshot.properties[0].name).toBe("Sunset Villa");
		expect(snapshot.properties[0].rooms).toHaveLength(1);
		expect(snapshot.properties[0].rooms[0].name).toBe("Room 101");
		expect(snapshot.properties[1].name).toBe("Ocean View");
		expect(snapshot.properties[1].rooms[0].name).toBe("Room A");
	});

	it("excludes properties that have no rooms", () => {
		const properties = [
			mockProperty({ id: "prop-1", name: "Empty Villa" }),
			mockProperty({ id: "prop-2", name: "Full Villa" }),
		];
		const rooms = [mockRoom({ propertyId: "prop-2", name: "Room A" })];

		const snapshot = computeOverviewSnapshot(
			properties,
			rooms,
			[],
			{},
			"2026-08",
		);

		expect(snapshot.properties).toHaveLength(1);
		expect(snapshot.properties[0].name).toBe("Full Villa");
	});

	it("computes paidCount per property", () => {
		const rooms = [
			mockRoom({ id: "room-1" }),
			mockRoom({ id: "room-2" }),
			mockRoom({ id: "room-3" }),
		];
		const payments = [
			mockPayment({ id: "pay-1", roomId: "room-1", status: "paid" }),
			mockPayment({ id: "pay-2", roomId: "room-2", status: "pending" }),
		];

		const snapshot = computeOverviewSnapshot(
			[mockProperty()],
			rooms,
			payments,
			{},
			"2026-08",
		);

		expect(snapshot.properties[0].paidCount).toBe(1);
	});
});

describe("computeOverviewSummary", () => {
	it("sums collected, pending and not-recorded counts", () => {
		const rooms: OverviewRoom[] = [
			mockOverviewRoom({
				id: "room-1",
				payment: mockPayment({ id: "pay-1", status: "paid", rentAmount: 100 }),
				total: 100,
			}),
			mockOverviewRoom({
				id: "room-2",
				payment: mockPayment({
					id: "pay-2",
					status: "pending",
					rentAmount: 80,
				}),
				total: 80,
			}),
			mockOverviewRoom({ id: "room-3" }),
		];

		const summary = computeOverviewSummary(rooms);

		expect(summary.totalRooms).toBe(3);
		expect(summary.paidCount).toBe(1);
		expect(summary.pendingCount).toBe(1);
		expect(summary.collected).toBe(100);
		expect(summary.pending).toBe(80);
		expect(summary.notRecordedCount).toBe(1);
	});

	it("includes charges in collected and pending totals", () => {
		const rooms: OverviewRoom[] = [
			mockOverviewRoom({
				id: "room-1",
				payment: mockPayment({ id: "pay-1", status: "paid", rentAmount: 100 }),
				total: 175,
			}),
			mockOverviewRoom({
				id: "room-2",
				payment: mockPayment({
					id: "pay-2",
					status: "pending",
					rentAmount: 60,
				}),
				total: 110,
			}),
		];

		const summary = computeOverviewSummary(rooms);

		expect(summary.paidCount).toBe(1);
		expect(summary.pendingCount).toBe(1);
		expect(summary.collected).toBe(175);
		expect(summary.pending).toBe(110);
		expect(summary.notRecordedCount).toBe(0);
	});

	it("returns zeroed summary for no rooms", () => {
		const summary = computeOverviewSummary([]);

		expect(summary).toEqual({
			totalRooms: 0,
			paidCount: 0,
			pendingCount: 0,
			collected: 0,
			pending: 0,
			notRecordedCount: 0,
		});
	});
});
