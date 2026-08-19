import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useBillingStore } from "./store";
import type { BillingStatus } from "./types";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockStatus = (overrides: Partial<BillingStatus> = {}): BillingStatus => ({
	tier: null,
	isPaid: false,
	roomLimit: 5,
	roomCount: 0,
	...overrides,
});

const authenticate = () => {
	useAuthStore.setState({ user: { id: "user-123" } as User });
};

const mockErrorConsole = () =>
	vi.spyOn(console, "error").mockImplementation(() => {});

describe("BillingStore", () => {
	beforeEach(() => {
		useBillingStore.setState({
			status: null,
			isStatusLoading: false,
			hasStatusFetched: false,
			isStatusFetchFailed: false,
			isCheckoutLoading: false,
		});
		useAuthStore.setState({ user: null });
		mockFetch.mockReset();
	});

	describe("fetchStatus", () => {
		it("does not fetch when unauthenticated", async () => {
			await useBillingStore.getState().fetchStatus();

			expect(mockFetch).not.toHaveBeenCalled();
			expect(useBillingStore.getState().hasStatusFetched).toBe(false);
		});

		it("fetches and sets status when authenticated", async () => {
			authenticate();
			const status = mockStatus({
				tier: "yearly",
				isPaid: true,
				roomLimit: null,
			});

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => status,
			});

			await useBillingStore.getState().fetchStatus();

			const {
				status: currentStatus,
				hasStatusFetched,
				isStatusLoading,
			} = useBillingStore.getState();
			expect(currentStatus).toEqual(status);
			expect(hasStatusFetched).toBe(true);
			expect(isStatusLoading).toBe(false);
		});

		it("sets isStatusFetchFailed on error", async () => {
			authenticate();
			const consoleSpy = mockErrorConsole();

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
			});

			await expect(useBillingStore.getState().fetchStatus()).rejects.toThrow();

			const { isStatusFetchFailed, isStatusLoading, hasStatusFetched } =
				useBillingStore.getState();
			expect(isStatusFetchFailed).toBe(true);
			expect(hasStatusFetched).toBe(true);
			expect(isStatusLoading).toBe(false);
			consoleSpy.mockRestore();
		});
	});

	describe("startCheckout", () => {
		it("does not start checkout when unauthenticated", async () => {
			const url = await useBillingStore.getState().startCheckout("monthly");

			expect(url).toBe("");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("posts the tier and returns the checkout url when authenticated", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ url: "https://checkout.polar.sh/x" }),
			});

			const url = await useBillingStore.getState().startCheckout("lifetime");

			expect(url).toBe("https://checkout.polar.sh/x");
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/billing/checkout",
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ tier: "lifetime" }),
				}),
			);
			expect(useBillingStore.getState().isCheckoutLoading).toBe(false);
		});

		it("throws on checkout failure", async () => {
			authenticate();
			const consoleSpy = mockErrorConsole();

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
			});

			await expect(
				useBillingStore.getState().startCheckout("monthly"),
			).rejects.toThrow();

			expect(useBillingStore.getState().isCheckoutLoading).toBe(false);
			consoleSpy.mockRestore();
		});
	});

	describe("startPortal", () => {
		it("does not open the portal when unauthenticated", async () => {
			const url = await useBillingStore.getState().startPortal();

			expect(url).toBe("");
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("returns the customer portal url when authenticated", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					url: "https://sandbox.polar.sh/portal?token=x",
				}),
			});

			const url = await useBillingStore.getState().startPortal();

			expect(url).toBe("https://sandbox.polar.sh/portal?token=x");
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/billing/portal",
				expect.objectContaining({
					method: "GET",
				}),
			);
			expect(useBillingStore.getState().isStatusLoading).toBe(false);
		});

		it("throws on portal failure", async () => {
			authenticate();
			const consoleSpy = mockErrorConsole();

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
			});

			await expect(useBillingStore.getState().startPortal()).rejects.toThrow();

			expect(useBillingStore.getState().isStatusLoading).toBe(false);
			consoleSpy.mockRestore();
		});
	});

	describe("clearStore", () => {
		it("resets all state", () => {
			useBillingStore.setState({
				status: mockStatus(),
				hasStatusFetched: true,
			});

			useBillingStore.getState().clearStore();

			expect(useBillingStore.getState()).toMatchObject({
				status: null,
				isStatusLoading: false,
				hasStatusFetched: false,
				isStatusFetchFailed: false,
				isCheckoutLoading: false,
			});
		});
	});
});
