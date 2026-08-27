import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import type { Property } from "@/components/dashboard/properties/types";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type { PaymentRecord } from "@/components/dashboard/rent-payments/types";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import type { Room } from "@/components/dashboard/rooms/types";
import { useOverviewStore } from "./store";

const mockFetch = vi.fn();
global.fetch = mockFetch;

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

const mockSnapshot = {
	period: "2026-08",
	properties: [
		{
			id: "prop-1",
			name: "Sunset Villa",
			rooms: [
				{
					id: "room-1",
					propertyId: "prop-1",
					name: "Room 101",
					monthlyRent: 800,
					payment: mockPayment({ status: "paid" }),
					charges: [
						{
							serviceId: "parking",
							serviceName: "Parking",
							pricingType: "flat",
							unitLabel: null,
							unitPrice: null,
							flatAmount: 50,
							usage: null,
							total: 50,
						},
					],
					total: 850,
				},
				{
					id: "room-2",
					propertyId: "prop-1",
					name: "Room 102",
					monthlyRent: 700,
					payment: null,
					charges: [],
					total: 0,
				},
			],
			paidCount: 1,
		},
	],
	rooms: [
		{
			id: "room-1",
			propertyId: "prop-1",
			name: "Room 101",
			monthlyRent: 800,
			payment: mockPayment({ status: "paid" }),
			charges: [
				{
					serviceId: "parking",
					serviceName: "Parking",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 50,
					usage: null,
					total: 50,
				},
			],
			total: 850,
		},
		{
			id: "room-2",
			propertyId: "prop-1",
			name: "Room 102",
			monthlyRent: 700,
			payment: null,
			charges: [],
			total: 0,
		},
	],
};

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

const authenticate = () => {
	useAuthStore.setState({ user: { id: "user-123" } as User });
};

describe("OverviewStore", () => {
	beforeEach(() => {
		useOverviewStore.getState().clearStore();
		useAuthStore.setState({ user: null });
		usePropertiesStore.setState({ properties: [] });
		useRoomsStore.setState({ rooms: [] });
		useRentPaymentsStore.setState({
			rentPayments: [],
			serviceChargesByPaymentId: {},
		});
		useRoomServicesStore.setState({ roomServicesByRoomId: {} });
		mockFetch.mockReset();
	});

	describe("fetchOverview (unauthenticated)", () => {
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

		it("does not call fetch when unauthenticated", async () => {
			seedLocalData();
			await useOverviewStore.getState().fetchOverview("2026-08");
			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe("fetchOverview (authenticated)", () => {
		it("fetches from API and sets snapshot", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockSnapshot,
			});

			await useOverviewStore.getState().fetchOverview("2026-08");

			const { snapshot, summary, isOverviewLoading, hasOverviewFetched } =
				useOverviewStore.getState();
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/overview?period=2026-08",
				expect.objectContaining({ method: "GET", credentials: "include" }),
			);
			expect(snapshot).toEqual(mockSnapshot);
			expect(summary?.totalRooms).toBe(2);
			expect(summary?.collected).toBe(850);
			expect(isOverviewLoading).toBe(false);
			expect(hasOverviewFetched).toBe(true);
		});

		it("deduplicates concurrent fetches for the same period", async () => {
			authenticate();
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => mockSnapshot,
			});

			await Promise.all([
				useOverviewStore.getState().fetchOverview("2026-08"),
				useOverviewStore.getState().fetchOverview("2026-08"),
			]);

			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it("marks fetch failed on error", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useOverviewStore.getState().fetchOverview("2026-08"),
			).rejects.toThrow("Failed to fetch overview");

			const { isOverviewLoading, isOverviewFetchFailed } =
				useOverviewStore.getState();
			expect(isOverviewLoading).toBe(false);
			expect(isOverviewFetchFailed).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("allows refetching a different period after failure", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useOverviewStore.getState().fetchOverview("2026-08"),
			).rejects.toThrow();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockSnapshot,
			});

			await useOverviewStore.getState().fetchOverview("2026-08");

			expect(useOverviewStore.getState().snapshot).toEqual(mockSnapshot);
			expect(useOverviewStore.getState().isOverviewFetchFailed).toBe(false);

			consoleSpy.mockRestore();
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

		it("updates properties rooms and paidCount alongside snapshot rooms", async () => {
			seedLocalData([
				mockPayment({ id: "pay-1", roomId: "room-1", status: "paid" }),
			]);
			await useOverviewStore.getState().fetchOverview("2026-08");

			const before = useOverviewStore.getState().snapshot;
			expect(before?.properties[0].rooms[0].payment?.status).toBe("paid");
			expect(before?.properties[0].paidCount).toBe(1);

			await useOverviewStore
				.getState()
				.togglePaymentStatus(mockPayment({ id: "pay-1", status: "paid" }));

			const after = useOverviewStore.getState().snapshot;
			expect(after?.properties[0].rooms[0].payment?.status).toBe("pending");
			expect(after?.properties[0].paidCount).toBe(0);
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

		it("clears togglingPaymentId on error", async () => {
			seedLocalData([
				mockPayment({ id: "pay-1", roomId: "room-1", status: "paid" }),
			]);
			await useOverviewStore.getState().fetchOverview("2026-08");

			useRentPaymentsStore.getState().updateRentPayment = vi
				.fn()
				.mockRejectedValue(new Error("fail"));

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useOverviewStore
					.getState()
					.togglePaymentStatus(mockPayment({ id: "pay-1", status: "paid" })),
			).rejects.toThrow();

			expect(useOverviewStore.getState().togglingPaymentId).toBeNull();
			consoleSpy.mockRestore();
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
