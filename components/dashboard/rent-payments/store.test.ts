import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useRentPaymentsStore } from "./store";
import type { PaymentRecord, ServiceCharge } from "./types";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPayment = (
	overrides: Partial<PaymentRecord> = {},
): PaymentRecord => ({
	id: "test-uuid",
	roomId: "room-1",
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

const mockErrorConsole = () =>
	vi.spyOn(console, "error").mockImplementation(() => {});

describe("RentPaymentsStore", () => {
	beforeEach(() => {
		useRentPaymentsStore.setState({
			rentPayments: [],
			isPaymentsLoading: false,
			fetchingRoomId: null,
			fetchingRoomChargesId: null,
			isPaymentsFetchFailed: false,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("fetchRentPaymentsByRoomId", () => {
		it("does not fetch when unauthenticated", async () => {
			await useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-1");

			expect(mockFetch).not.toHaveBeenCalled();
			expect(useRentPaymentsStore.getState().isPaymentsLoading).toBe(false);
		});

		it("fetches and sets payments when authenticated", async () => {
			authenticate();

			const mockResponse = [
				mockPayment({
					id: "p1",
					period: "2026-01",
					rentAmount: 1500000,
				}),
				mockPayment({
					id: "p2",
					period: "2025-12",
					rentAmount: 1500000,
					status: "paid",
				}),
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-1");

			const { rentPayments, isPaymentsLoading } =
				useRentPaymentsStore.getState();
			expect(rentPayments).toEqual(mockResponse);
			expect(isPaymentsLoading).toBe(false);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rent-payments?roomId=room-1",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-1"),
			).rejects.toThrow("Failed to fetch rent payments");

			const { rentPayments, isPaymentsLoading, isPaymentsFetchFailed } =
				useRentPaymentsStore.getState();
			expect(rentPayments).toEqual([]);
			expect(isPaymentsLoading).toBe(false);
			expect(isPaymentsFetchFailed).toBe(true);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("fetches payments for different rooms independently", async () => {
			authenticate();

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						mockPayment({
							id: "p1",
							rentAmount: 1500,
						}),
					],
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						mockPayment({
							id: "p2",
							roomId: "room-2",
							rentAmount: 2000,
							status: "paid",
						}),
					],
				});

			await Promise.all([
				useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-1"),
				useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-2"),
			]);

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(2);
			expect(rentPayments.find((p) => p.roomId === "room-1")?.rentAmount).toBe(
				1500,
			);
			expect(rentPayments.find((p) => p.roomId === "room-2")?.rentAmount).toBe(
				2000,
			);
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});
	});

	describe("createRentPayment", () => {
		it("creates a payment locally when unauthenticated", async () => {
			await useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(1);
			expect(rentPayments[0]).toEqual(
				mockPayment({
					period: "2025-03",
					rentAmount: 1200,
				}),
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () =>
					mockPayment({
						id: "server-id",
						roomId: "room-1",
						period: "2025-03",
						rentAmount: 1200,
						status: "paid",
					}),
			});

			await useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200, "paid");

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(1);
			expect(rentPayments[0]).toEqual(
				mockPayment({
					id: "server-id",
					roomId: "room-1",
					period: "2025-03",
					rentAmount: 1200,
					status: "paid",
				}),
			);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rent-payments",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						roomId: "room-1",
						period: "2025-03",
						rentAmount: 1200,
						status: "paid",
					}),
				}),
			);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRentPaymentsStore
					.getState()
					.createRentPayment("room-1", "2025-03", 1200),
			).rejects.toThrow("Failed to create rent payment");

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(0);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("updateRentPayment", () => {
		it("updates payment locally when unauthenticated", async () => {
			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({
						id: "payment-1",
						period: "2025-03",
						rentAmount: 1200,
					}),
					mockPayment({
						id: "payment-2",
						period: "2025-04",
						rentAmount: 1300,
					}),
				],
			});

			await useRentPaymentsStore
				.getState()
				.updateRentPayment("payment-1", "2025-05", 1500, "paid");

			expect(mockFetch).not.toHaveBeenCalled();
			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(2);
			expect(updatedPayments.find((p) => p.id === "payment-1")).toEqual(
				mockPayment({
					id: "payment-1",
					period: "2025-05",
					rentAmount: 1500,
					status: "paid",
				}),
			);
			expect(updatedPayments.find((p) => p.id === "payment-2")).toEqual(
				mockPayment({
					id: "payment-2",
					period: "2025-04",
					rentAmount: 1300,
				}),
			);
		});

		it("calls API and updates payment when authenticated", async () => {
			authenticate();

			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({
						id: "payment-1",
						period: "2025-03",
						rentAmount: 1200,
					}),
				],
			});

			const serverResponse = mockPayment({
				id: "payment-1",
				roomId: "room-1",
				period: "2025-05",
				rentAmount: 1500,
				status: "paid",
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => serverResponse,
			});

			await useRentPaymentsStore
				.getState()
				.updateRentPayment("payment-1", "2025-05", 1500, "paid");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rent-payments/payment-1",
				expect.objectContaining({
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						period: "2025-05",
						rentAmount: 1500,
						status: "paid",
					}),
					credentials: "include",
				}),
			);

			const updatedPayment = useRentPaymentsStore
				.getState()
				.rentPayments.find((p) => p.id === "payment-1");
			expect(updatedPayment).toEqual(serverResponse);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({
						id: "payment-1",
						period: "2025-03",
						rentAmount: 1200,
					}),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRentPaymentsStore
					.getState()
					.updateRentPayment("payment-1", "2025-05", 1500, "paid"),
			).rejects.toThrow("Failed to update rent payment");

			const updatedPayment = useRentPaymentsStore
				.getState()
				.rentPayments.find((p) => p.id === "payment-1");
			expect(updatedPayment?.rentAmount).toBe(1200);
			expect(updatedPayment?.period).toBe("2025-03");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deleteRentPayment", () => {
		it("deletes payment locally when unauthenticated", async () => {
			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({
						id: "payment-1",
						period: "2025-03",
						rentAmount: 1200,
					}),
					mockPayment({
						id: "payment-2",
						period: "2025-04",
						rentAmount: 1300,
					}),
				],
			});

			await useRentPaymentsStore.getState().deleteRentPayment("payment-1");

			expect(mockFetch).not.toHaveBeenCalled();
			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(1);
			expect(updatedPayments[0].id).toBe("payment-2");
		});

		it("calls API and removes payment when authenticated", async () => {
			authenticate();

			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({
						id: "payment-1",
						period: "2025-03",
						rentAmount: 1200,
					}),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: true });

			await useRentPaymentsStore.getState().deleteRentPayment("payment-1");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rent-payments/payment-1",
				expect.objectContaining({
					method: "DELETE",
					credentials: "include",
				}),
			);
			expect(useRentPaymentsStore.getState().rentPayments).toHaveLength(0);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({
						id: "payment-1",
						period: "2025-03",
						rentAmount: 1200,
					}),
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRentPaymentsStore.getState().deleteRentPayment("payment-1"),
			).rejects.toThrow("Failed to delete rent payment");

			expect(useRentPaymentsStore.getState().rentPayments).toHaveLength(1);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			useRentPaymentsStore.setState({
				rentPayments: [
					mockPayment({
						id: "1",
						period: "2025-03",
						rentAmount: 1200,
					}),
				],
				serviceChargesByPaymentId: { "payment-1": [mockServiceCharge()] },
				isPaymentsLoading: true,
				fetchingRoomId: "room-1",
				isPaymentsFetchFailed: true,
			});

			useRentPaymentsStore.getState().clearStore();

			const state = useRentPaymentsStore.getState();
			expect(state.rentPayments).toEqual([]);
			expect(state.serviceChargesByPaymentId).toEqual({});
			expect(state.isPaymentsLoading).toBe(false);
			expect(state.fetchingRoomId).toBeNull();
			expect(state.isPaymentsFetchFailed).toBe(false);
		});
	});

	describe("saveRentPaymentCharges", () => {
		it("saves charges locally when unauthenticated", async () => {
			const charges = [mockServiceCharge()];

			await useRentPaymentsStore
				.getState()
				.saveRentPaymentCharges("payment-1", charges);

			expect(mockFetch).not.toHaveBeenCalled();
			expect(
				useRentPaymentsStore.getState().serviceChargesByPaymentId["payment-1"],
			).toEqual(charges);
		});

		it("calls API and writes to store when authenticated", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: true });

			const charges = [
				mockServiceCharge({ total: 75 }),
				mockServiceCharge({
					serviceId: "svc-2",
					serviceName: "Water",
					pricingType: "flat",
					unitLabel: null,
					unitPrice: null,
					flatAmount: 50,
					usage: null,
					total: 50,
				}),
			];

			await useRentPaymentsStore
				.getState()
				.saveRentPaymentCharges("payment-1", charges);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rent-payments/payment-1/service-charges",
				expect.objectContaining({
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(
						charges.map(({ total: _total, ...rest }) => rest),
					),
					credentials: "include",
				}),
			);
			expect(
				useRentPaymentsStore.getState().serviceChargesByPaymentId["payment-1"],
			).toEqual(charges);
		});

		it("handles API error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRentPaymentsStore
					.getState()
					.saveRentPaymentCharges("payment-1", [mockServiceCharge()]),
			).rejects.toThrow("Failed to save rent payment charges");

			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("fetchRentPaymentChargesByRoomId", () => {
		it("returns empty when unauthenticated", async () => {
			const result = await useRentPaymentsStore
				.getState()
				.fetchRentPaymentChargesByRoomId("room-1");

			expect(result).toEqual({});
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("fetches, merges into store, and returns charges when authenticated", async () => {
			authenticate();

			const mockResponse: Record<string, ServiceCharge[]> = {
				"payment-1": [mockServiceCharge()],
				"payment-2": [
					mockServiceCharge({
						serviceId: "svc-2",
						serviceName: "Water",
						total: 50,
					}),
				],
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await useRentPaymentsStore
				.getState()
				.fetchRentPaymentChargesByRoomId("room-1");

			expect(result).toEqual(mockResponse);
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/rent-payment-charges",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
			expect(useRentPaymentsStore.getState().fetchingRoomChargesId).toBeNull();
			expect(useRentPaymentsStore.getState().serviceChargesByPaymentId).toEqual(
				mockResponse,
			);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = mockErrorConsole();

			await expect(
				useRentPaymentsStore
					.getState()
					.fetchRentPaymentChargesByRoomId("room-1"),
			).rejects.toThrow("Failed to fetch rent payment charges");

			expect(useRentPaymentsStore.getState().fetchingRoomChargesId).toBeNull();
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});
