import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "@/components/dashboard/auth/store";
import type { BillingStatus, BillingTier } from "./types";

interface BillingState {
	status: BillingStatus | null;
	isStatusLoading: boolean;
	hasStatusFetched: boolean;
	statusFetchFailed: boolean;
	isCheckoutLoading: boolean;

	fetchStatus: () => Promise<void>;
	startCheckout: (tier: BillingTier) => Promise<string>;
	startPortal: () => Promise<string>;
	clearStore: () => void;
}

const initialState = {
	status: null,
	isStatusLoading: false,
	hasStatusFetched: false,
	statusFetchFailed: false,
	isCheckoutLoading: false,
};

export const useBillingStore = create<BillingState>()(
	devtools(
		(set, get) => ({
			...initialState,

			fetchStatus: async () => {
				const user = useAuthStore.getState().user;
				if (!user) return;

				const { isStatusLoading } = get();
				if (isStatusLoading) return;

				try {
					set({ isStatusLoading: true, statusFetchFailed: false });
					const res = await fetch("/api/billing/status", {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to fetch billing status");
					}

					const data = (await res.json()) as BillingStatus;
					set({
						status: data,
						isStatusLoading: false,
						hasStatusFetched: true,
					});
				} catch (error) {
					console.error("Failed to fetch billing status:", error);
					set({
						isStatusLoading: false,
						hasStatusFetched: true,
						statusFetchFailed: true,
					});
					throw error;
				}
			},

			startCheckout: async (tier) => {
				const user = useAuthStore.getState().user;
				if (!user) return "";

				try {
					set({ isCheckoutLoading: true });
					const res = await fetch("/api/billing/checkout", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ tier }),
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to start checkout");
					}

					const data = (await res.json()) as { url: string };
					set({ isCheckoutLoading: false });
					return data.url;
				} catch (error) {
					console.error("Failed to start checkout:", error);
					set({ isCheckoutLoading: false });
					throw error;
				}
			},

			startPortal: async () => {
				const user = useAuthStore.getState().user;
				if (!user) return "";

				try {
					set({ isStatusLoading: true });
					const res = await fetch("/api/billing/portal", {
						method: "GET",
						credentials: "include",
					});

					if (!res.ok) {
						throw new Error("Failed to open customer portal");
					}

					const data = (await res.json()) as { url: string };
					set({ isStatusLoading: false });
					return data.url;
				} catch (error) {
					console.error("Failed to open customer portal:", error);
					set({ isStatusLoading: false });
					throw error;
				}
			},

			clearStore: () => set(initialState),
		}),
		{ name: "billing" },
	),
);
