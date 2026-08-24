// @vitest-environment happy-dom
import type { User } from "@supabase/supabase-js";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type {
	PaymentRecord,
	ServiceCharge,
} from "@/components/dashboard/rent-payments/types";
import { useRoomServicesStore } from "./room-services-store";
import type { RoomService } from "./types";
import { useRoomPayments } from "./use-room-payments";

const ROOM_ID = "room-1";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPayment = (
	overrides: Partial<PaymentRecord> = {},
): PaymentRecord => ({
	id: "test-uuid",
	roomId: ROOM_ID,
	period: "2026-01",
	rentAmount: 1500,
	status: "pending",
	...overrides,
});

const mockServiceCharge = (
	overrides: Partial<ServiceCharge> = {},
): ServiceCharge => ({
	serviceId: "svc-1",
	serviceName: "Electricity",
	pricingType: "variable",
	unitLabel: "kWh",
	unitPrice: 0.15,
	flatAmount: null,
	usage: 500,
	total: 75,
	...overrides,
});

const authenticate = () => {
	useAuthStore.setState({ user: { id: "user-123" } as User });
};

const mockApi = ({
	payments = [],
	charges = {},
}: {
	payments?: PaymentRecord[];
	charges?: Record<string, ServiceCharge[]>;
} = {}) => {
	mockFetch.mockImplementation((url: string) => {
		if (url.includes("/rent-payment-charges")) {
			return Promise.resolve({ ok: true, json: async () => charges });
		}
		if (url.includes("/rent-payments")) {
			return Promise.resolve({ ok: true, json: async () => payments });
		}
		return Promise.resolve({ ok: true, json: async () => [] });
	});
};

describe("useRoomPayments", () => {
	beforeEach(() => {
		useRentPaymentsStore.setState({
			rentPayments: [],
			isPaymentsLoading: false,
			fetchingRoomId: null,
			fetchingRoomChargesId: null,
			isPaymentsFetchFailed: false,
			serviceChargesByPaymentId: {},
		});
		useRoomServicesStore.setState({
			roomServicesByRoomId: {},
			isRoomServicesLoading: false,
			fetchingRoomId: null,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("rentPayments", () => {
		it("filters by room and sorts by period descending", () => {
			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({ id: "p1", roomId: ROOM_ID, period: "2025-12" }),
					mockPayment({ id: "p2", roomId: "room-2", period: "2026-01" }),
					mockPayment({ id: "p3", roomId: ROOM_ID, period: "2025-06" }),
					mockPayment({ id: "p4", roomId: ROOM_ID, period: "2026-01" }),
				],
			});

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			expect(result.current.rentPayments.map((p) => p.id)).toEqual([
				"p4",
				"p1",
				"p3",
			]);
		});
	});

	describe("charges", () => {
		it("marks initialized when room has no payments", async () => {
			authenticate();
			mockApi();

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			await waitFor(() => expect(result.current.chargesInitialized).toBe(true));
			expect(result.current.serviceChargesByPeriod).toEqual({});
		});

		it("maps persisted charges by period", async () => {
			authenticate();
			const payment = mockPayment({ id: "p1", roomId: ROOM_ID });
			mockApi({
				payments: [payment],
				charges: { p1: [mockServiceCharge()] },
			});

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			await waitFor(() => expect(result.current.chargesInitialized).toBe(true));
			expect(result.current.serviceChargesByPeriod["2026-01"]).toEqual([
				mockServiceCharge(),
			]);
		});

		it("still marks initialized when charges fetch fails", async () => {
			authenticate();
			const payment = mockPayment({ id: "p1", roomId: ROOM_ID });
			vi.spyOn(console, "error").mockImplementation(() => {});

			mockFetch.mockImplementation((url: string) => {
				if (url.includes("/rent-payment-charges"))
					return Promise.resolve({ ok: false } as Response);
				if (url.includes("/rent-payments"))
					return Promise.resolve({ ok: true, json: async () => [payment] });
				return Promise.resolve({ ok: true, json: async () => [] });
			});

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			await waitFor(() => expect(result.current.chargesInitialized).toBe(true));
		});

		it("waits for payments fetch before initializing", async () => {
			authenticate();
			mockFetch.mockImplementation((url: string) => {
				if (url.includes("/rent-payments?roomId="))
					return new Promise(() => {});
				return Promise.resolve({ ok: true, json: async () => [] });
			});

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			await act(async () => {
				await new Promise((r) => setTimeout(r, 50));
			});

			expect(result.current.chargesInitialized).toBe(false);
		});

		it("does not refetch charges on rerender", async () => {
			authenticate();
			const payment = mockPayment({ id: "p1", roomId: ROOM_ID });
			mockApi({ payments: [payment], charges: { p1: [mockServiceCharge()] } });

			const { result, rerender } = renderHook(
				({ roomId }) => useRoomPayments(roomId),
				{ initialProps: { roomId: ROOM_ID } },
			);

			await waitFor(() => expect(result.current.chargesInitialized).toBe(true));

			const calls = mockFetch.mock.calls.filter(([url]) =>
				String(url).includes("rent-payment-charges"),
			).length;

			rerender({ roomId: ROOM_ID });

			await act(async () => {
				await new Promise((r) => setTimeout(r, 50));
			});

			expect(
				mockFetch.mock.calls.filter(([url]) =>
					String(url).includes("rent-payment-charges"),
				).length,
			).toBe(calls);
		});

		it("loads charges after payments arrive asynchronously", async () => {
			authenticate();

			let resolvePayments!: (value: Response) => void;
			mockFetch.mockImplementation((url: string) => {
				if (url.includes("/rent-payments?roomId=")) {
					return new Promise((resolve) => {
						resolvePayments = resolve;
					});
				}
				if (url.includes("/rent-payment-charges")) {
					return Promise.resolve({
						ok: true,
						json: async () => ({ p1: [mockServiceCharge()] }),
					});
				}
				return Promise.resolve({ ok: true, json: async () => [] });
			});

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			await act(async () => {
				await new Promise((r) => setTimeout(r, 50));
			});
			expect(result.current.chargesInitialized).toBe(false);

			const payment = mockPayment({ id: "p1", roomId: ROOM_ID });
			await act(async () => {
				resolvePayments({
					ok: true,
					json: async () => [payment],
				} as Response);
				await new Promise((r) => setTimeout(r, 0));
			});

			useRentPaymentsStore.setState({
				rentPayments: [payment],
				isPaymentsLoading: false,
			});

			await waitFor(() => expect(result.current.chargesInitialized).toBe(true));
		});
	});

	describe("defaultCharges", () => {
		it("derives charges from room services", () => {
			const services: RoomService[] = [
				{
					id: "rs-1",
					roomId: ROOM_ID,
					serviceId: "svc-1",
					serviceName: "Electricity",
					pricingType: "variable",
					unitLabel: "kWh",
					unitPrice: 0.15,
					flatAmount: null,
				},
				{
					id: "rs-2",
					roomId: ROOM_ID,
					serviceId: "svc-2",
					serviceName: "Internet",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 100,
				},
			];
			useRoomServicesStore.setState({
				roomServicesByRoomId: { [ROOM_ID]: services },
			});

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			expect(result.current.defaultCharges).toEqual([
				{
					serviceId: "svc-1",
					serviceName: "Electricity",
					pricingType: "variable",
					unitLabel: "kWh",
					unitPrice: 0.15,
					flatAmount: null,
					usage: 0,
					total: 0,
				},
				{
					serviceId: "svc-2",
					serviceName: "Internet",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 100,
					usage: null,
					total: 100,
				},
			]);
		});
	});

	describe("updateServiceCharges", () => {
		it("optimistically updates local state and persists via API", async () => {
			authenticate();
			const payment = mockPayment({ id: "p1", roomId: ROOM_ID });
			mockApi({ payments: [payment] });

			const { result } = renderHook(() => useRoomPayments(ROOM_ID));

			const charges = [mockServiceCharge({ total: 99 })];
			mockFetch.mockResolvedValueOnce({ ok: true } as Response);

			await act(async () => {
				await result.current.updateServiceCharges("2026-01", charges, "p1");
			});

			expect(result.current.serviceChargesByPeriod["2026-01"]).toEqual(charges);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rent-payments/p1/service-charges",
				expect.objectContaining({ method: "PATCH", credentials: "include" }),
			);
		});
	});
});
