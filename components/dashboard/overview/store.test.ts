import { beforeEach, describe, expect, it } from "vitest";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import type { Property } from "@/components/dashboard/properties/types";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type { PaymentRecord } from "@/components/dashboard/rent-payments/types";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import type { Room } from "@/components/dashboard/rooms/types";
import { useOverviewStore } from "./store";

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

const seedLocalData = (payments: PaymentRecord[] = []) => {
	usePropertiesStore.setState({ properties: [mockProperty()] });
	useRoomsStore.setState({
		rooms: [mockRoom(), mockRoom({ id: "room-2", name: "Room 102" })],
	});
	useRentPaymentsStore.setState({
		rentPayments: payments,
		serviceChargesByPaymentId: {},
	});
};

describe("OverviewStore", () => {
	beforeEach(() => {
		useOverviewStore.getState().clearStore();
		usePropertiesStore.setState({ properties: [] });
		useRoomsStore.setState({ rooms: [] });
		useRentPaymentsStore.setState({
			rentPayments: [],
			serviceChargesByPaymentId: {},
		});
		useRoomServicesStore.setState({ roomServicesByRoomId: {} });
	});

	describe("fetchOverview", () => {
		it("composes snapshot from local stores", async () => {
			seedLocalData([
				mockPayment({ id: "pay-1", roomId: "room-1", status: "paid" }),
			]);

			await useOverviewStore.getState().fetchOverview("2026-08");

			const { snapshot, summary, hasOverviewFetched, isOverviewLoading } =
				useOverviewStore.getState();
			expect(hasOverviewFetched).toBe(true);
			expect(isOverviewLoading).toBe(false);
			expect(snapshot?.period).toBe("2026-08");
			expect(snapshot?.rooms).toHaveLength(2);
			expect(snapshot?.rooms[0].payment?.id).toBe("pay-1");
			expect(summary?.totalRooms).toBe(2);
			expect(summary?.collected).toBe(800);
		});

		it("recomposes when local stores change", async () => {
			await useOverviewStore.getState().fetchOverview("2026-08");
			expect(useOverviewStore.getState().snapshot?.rooms).toHaveLength(0);

			seedLocalData([mockPayment({ id: "pay-1", status: "paid" })]);
			await useOverviewStore.getState().fetchOverview("2026-08");

			expect(useOverviewStore.getState().snapshot?.rooms).toHaveLength(2);
			expect(useOverviewStore.getState().summary?.collected).toBe(800);
		});

		it("recomposes when period changes", async () => {
			seedLocalData([mockPayment({ id: "pay-1", status: "paid" })]);

			await useOverviewStore.getState().fetchOverview("2026-08");
			const first = useOverviewStore.getState().snapshot;

			await useOverviewStore.getState().fetchOverview("2026-09");
			const second = useOverviewStore.getState().snapshot;

			expect(second?.period).toBe("2026-09");
			expect(second?.rooms[0].payment).toBeNull();
			expect(first?.rooms[0].payment).not.toBeNull();
		});

		it("includes service charges from store in total", async () => {
			seedLocalData([
				mockPayment({ id: "pay-1", roomId: "room-1", status: "paid" }),
			]);
			useRentPaymentsStore.setState({
				serviceChargesByPaymentId: {
					"pay-1": [
						{
							serviceId: "svc-1",
							serviceName: "Electricity",
							pricingType: "flat",
							total: 50,
						},
					],
				},
			});

			await useOverviewStore.getState().fetchOverview("2026-08");

			const room = useOverviewStore
				.getState()
				.snapshot?.rooms.find((r) => r.id === "room-1");
			expect(room?.total).toBe(850);
			expect(room?.charges).toHaveLength(1);
			expect(useOverviewStore.getState().summary?.collected).toBe(850);
		});

		it("ignores unrecorded room services", async () => {
			seedLocalData([
				mockPayment({ id: "pay-1", roomId: "room-1", status: "paid" }),
			]);
			useRoomServicesStore.setState({
				roomServicesByRoomId: {
					"room-1": [
						{
							id: "rs-1",
							roomId: "room-1",
							serviceId: "svc-electricity",
							serviceName: "Electricity",
							pricingType: "flat",
							flatAmount: 50,
							unitPrice: null,
							unitLabel: null,
						},
					],
				},
			});

			await useOverviewStore.getState().fetchOverview("2026-08");

			const room = useOverviewStore
				.getState()
				.snapshot?.rooms.find((r) => r.id === "room-1");
			expect(room?.total).toBe(800);
			expect(room?.charges).toHaveLength(0);
		});
	});

	describe("togglePaymentStatus", () => {
		it("flips status and updates snapshot and summary", async () => {
			seedLocalData([
				mockPayment({ id: "pay-1", roomId: "room-1", status: "paid" }),
			]);
			await useOverviewStore.getState().fetchOverview("2026-08");

			await useOverviewStore
				.getState()
				.togglePaymentStatus(mockPayment({ id: "pay-1", status: "paid" }));

			const { snapshot, summary } = useOverviewStore.getState();
			expect(snapshot?.rooms[0].payment?.status).toBe("pending");
			expect(summary?.collected).toBe(0);
			expect(summary?.pending).toBe(800);
		});

		it("preserves service charges through toggle", async () => {
			seedLocalData([
				mockPayment({ id: "pay-1", roomId: "room-1", status: "pending" }),
			]);
			useRentPaymentsStore.setState({
				serviceChargesByPaymentId: {
					"pay-1": [
						{
							serviceId: "svc-1",
							serviceName: "Electricity",
							pricingType: "flat",
							total: 50,
						},
					],
				},
			});
			await useOverviewStore.getState().fetchOverview("2026-08");
			expect(useOverviewStore.getState().summary?.pending).toBe(850);

			await useOverviewStore
				.getState()
				.togglePaymentStatus(mockPayment({ id: "pay-1", status: "pending" }));

			const { snapshot, summary } = useOverviewStore.getState();
			expect(snapshot?.rooms[0].payment?.status).toBe("paid");
			expect(snapshot?.rooms[0].total).toBe(850);
			expect(summary?.collected).toBe(850);
			expect(summary?.pending).toBe(0);
		});
	});

	describe("clearStore", () => {
		it("resets all state", async () => {
			seedLocalData([mockPayment({ id: "pay-1", status: "paid" })]);
			await useOverviewStore.getState().fetchOverview("2026-08");

			useOverviewStore.getState().clearStore();

			const state = useOverviewStore.getState();
			expect(state.snapshot).toBeNull();
			expect(state.summary).toBeNull();
			expect(state.period).toBeNull();
			expect(state.hasOverviewFetched).toBe(false);
		});
	});
});
