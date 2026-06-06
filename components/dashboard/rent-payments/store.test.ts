import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useRentPaymentsStore } from "./store";

Object.defineProperty(global, "crypto", {
	value: {
		randomUUID: () => "test-uuid",
	},
});

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("RentPaymentsStore", () => {
	beforeEach(() => {
		useRentPaymentsStore.setState({
			rentPayments: [],
			isPaymentsLoading: false,
			loadingRoomIds: [],
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
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			const mockResponse = [
				{
					id: "p1",
					roomId: "room-1",
					period: "2026-01",
					amount: 1500000,
					status: "pending",
				},
				{
					id: "p2",
					roomId: "room-1",
					period: "2025-12",
					amount: 1500000,
					status: "paid",
				},
			];

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			await useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-1");

			const { rentPayments, isPaymentsLoading } =
				useRentPaymentsStore.getState();
			expect(rentPayments).toEqual([
				{
					id: "p1",
					roomId: "room-1",
					period: "2026-01",
					amount: 1500000,
					status: "pending",
				},
				{
					id: "p2",
					roomId: "room-1",
					period: "2025-12",
					amount: 1500000,
					status: "paid",
				},
			]);
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
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-1"),
			).rejects.toThrow("Failed to fetch rent payments");

			const { rentPayments, isPaymentsLoading } =
				useRentPaymentsStore.getState();
			expect(rentPayments).toEqual([]);
			expect(isPaymentsLoading).toBe(false);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it("fetches payments for different rooms independently", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						{
							id: "p1",
							roomId: "room-1",
							period: "2026-01",
							amount: 1500,
							status: "pending",
						},
					],
				})
				.mockResolvedValueOnce({
					ok: true,
					json: async () => [
						{
							id: "p2",
							roomId: "room-2",
							period: "2026-01",
							amount: 2000,
							status: "paid",
						},
					],
				});

			await Promise.all([
				useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-1"),
				useRentPaymentsStore.getState().fetchRentPaymentsByRoomId("room-2"),
			]);

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(2);
			expect(rentPayments.find((p) => p.roomId === "room-1")?.amount).toBe(
				1500,
			);
			expect(rentPayments.find((p) => p.roomId === "room-2")?.amount).toBe(
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
			expect(rentPayments[0]).toEqual({
				id: "test-uuid",
				roomId: "room-1",
				period: "2025-03",
				amount: 1200,
				status: "pending",
			});
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("calls API and updates state when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: "server-id",
					roomId: "room-1",
					period: "2025-03",
					amount: 1200,
					status: "paid",
				}),
			});

			await useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200, "paid");

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(1);
			expect(rentPayments[0]).toEqual({
				id: "server-id",
				roomId: "room-1",
				period: "2025-03",
				amount: 1200,
				status: "paid",
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rent-payments",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "paid",
					}),
				}),
			);
		});

		it("handles API error gracefully", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

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
					{
						id: "payment-1",
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "pending",
					},
					{
						id: "payment-2",
						roomId: "room-1",
						period: "2025-04",
						amount: 1300,
						status: "pending",
					},
				],
			});

			await useRentPaymentsStore
				.getState()
				.updateRentPayment("payment-1", "2025-05", 1500, "paid");

			expect(mockFetch).not.toHaveBeenCalled();
			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(2);
			expect(updatedPayments.find((p) => p.id === "payment-1")).toEqual({
				id: "payment-1",
				roomId: "room-1",
				period: "2025-05",
				amount: 1500,
				status: "paid",
			});
			expect(updatedPayments.find((p) => p.id === "payment-2")).toEqual({
				id: "payment-2",
				roomId: "room-1",
				period: "2025-04",
				amount: 1300,
				status: "pending",
			});
		});

		it("calls API and updates payment when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRentPaymentsStore.setState({
				rentPayments: [
					{
						id: "payment-1",
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "pending",
					},
				],
			});

			const serverResponse = {
				id: "payment-1",
				roomId: "room-1",
				period: "2025-05",
				amount: 1500,
				status: "paid",
			};

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
						amount: 1500,
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
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRentPaymentsStore.setState({
				rentPayments: [
					{
						id: "payment-1",
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "pending",
					},
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useRentPaymentsStore
					.getState()
					.updateRentPayment("payment-1", "2025-05", 1500, "paid"),
			).rejects.toThrow("Failed to update rent payment");

			const updatedPayment = useRentPaymentsStore
				.getState()
				.rentPayments.find((p) => p.id === "payment-1");
			expect(updatedPayment?.amount).toBe(1200);
			expect(updatedPayment?.period).toBe("2025-03");
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});

	describe("deleteRentPayment", () => {
		it("deletes payment locally when unauthenticated", async () => {
			useRentPaymentsStore.setState({
				rentPayments: [
					{
						id: "payment-1",
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "pending",
					},
					{
						id: "payment-2",
						roomId: "room-1",
						period: "2025-04",
						amount: 1300,
						status: "pending",
					},
				],
			});

			await useRentPaymentsStore.getState().deleteRentPayment("payment-1");

			expect(mockFetch).not.toHaveBeenCalled();
			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(1);
			expect(updatedPayments[0].id).toBe("payment-2");
		});

		it("calls API and removes payment when authenticated", async () => {
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRentPaymentsStore.setState({
				rentPayments: [
					{
						id: "payment-1",
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "pending",
					},
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
			useAuthStore.setState({
				user: { id: "user-123" } as User,
			});

			useRentPaymentsStore.setState({
				rentPayments: [
					{
						id: "payment-1",
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "pending",
					},
				],
			});

			mockFetch.mockResolvedValueOnce({ ok: false });

			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

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
					{
						id: "1",
						roomId: "room-1",
						period: "2025-03",
						amount: 1200,
						status: "pending",
					},
				],
				isPaymentsLoading: true,
				loadingRoomIds: ["room-1"],
			});

			useRentPaymentsStore.getState().clearStore();

			expect(useRentPaymentsStore.getState().rentPayments).toEqual([]);
			expect(useRentPaymentsStore.getState().isPaymentsLoading).toBe(false);
			expect(useRentPaymentsStore.getState().loadingRoomIds).toEqual([]);
		});
	});
});
