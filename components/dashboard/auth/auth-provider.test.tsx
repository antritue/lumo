import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { supabase } from "@/lib/supabase";
import { renderWithProviders } from "@/test/render";
import { AuthProvider } from "./auth-provider";
import { useAuthStore } from "./store";

vi.mock("@/lib/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn(),
			onAuthStateChange: vi.fn(() => ({
				data: { subscription: { unsubscribe: vi.fn() } },
			})),
		},
	},
}));

describe("AuthProvider", () => {
	it("initializes auth state on mount", async () => {
		const mockUser = { id: "123", email: "test@example.com" } as User;
		vi.mocked(supabase.auth.getSession).mockResolvedValue({
			data: { session: { user: mockUser } as Session },
			error: null,
		});

		renderWithProviders(
			<AuthProvider>
				<div>Child</div>
			</AuthProvider>,
		);

		await waitFor(() => {
			expect(useAuthStore.getState().user).toEqual(mockUser);
			expect(useAuthStore.getState().loading).toBe(false);
		});
	});

	it("updates user state when onAuthStateChange fires", async () => {
		const mockUnsubscribe = vi.fn();
		let authCallback:
			| ((event: AuthChangeEvent, session: Session | null) => void)
			| undefined;

		vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
			authCallback = cb;
			return {
				data: {
					subscription: {
						id: "test-subscription",
						callback: cb,
						unsubscribe: mockUnsubscribe,
					},
				},
			};
		});

		vi.mocked(supabase.auth.getSession).mockResolvedValue({
			data: { session: null },
			error: null,
		});

		renderWithProviders(
			<AuthProvider>
				<div>Child</div>
			</AuthProvider>,
		);

		const updatedUser = { id: "456", email: "new@example.com" } as User;

		await waitFor(() => {
			authCallback?.("SIGNED_IN", { user: updatedUser } as Session);
			expect(useAuthStore.getState().user).toEqual(updatedUser);
		});
	});

	it("clears all stores when user signs out", async () => {
		let authCallback:
			| ((event: AuthChangeEvent, session: Session | null) => void)
			| undefined;

		vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
			authCallback = cb;
			return {
				data: {
					subscription: {
						id: "test-subscription",
						callback: cb,
						unsubscribe: vi.fn(),
					},
				},
			};
		});

		const mockUser = { id: "123", email: "test@example.com" } as User;
		vi.mocked(supabase.auth.getSession).mockResolvedValue({
			data: { session: { user: mockUser } as Session },
			error: null,
		});

		renderWithProviders(
			<AuthProvider>
				<div>Child</div>
			</AuthProvider>,
		);

		await waitFor(() => {
			expect(useAuthStore.getState().user).toEqual(mockUser);
		});

		// Populate all stores
		useAuthStore.getState().dismissAuthBanner();
		usePropertiesStore.setState({
			properties: [{ id: "1", userId: "123", name: "Property 1" }],
			hasFetched: true,
		});
		useRoomsStore.setState({
			rooms: [
				{
					id: "1",
					propertyId: "1",
					name: "Room 1",
					monthlyRent: 1500,
					notes: null,
				},
			],
		});
		useRentPaymentsStore.setState({
			rentPayments: [
				{
					id: "1",
					roomId: "1",
					period: "2025-03",
					amount: 1500,
					status: "pending",
				},
			],
		});

		authCallback?.("SIGNED_OUT", null);

		await waitFor(() => {
			expect(useAuthStore.getState().user).toBeNull();
			expect(useAuthStore.getState().isAuthBannerDismissed).toBe(false);
			expect(usePropertiesStore.getState().properties).toEqual([]);
			expect(usePropertiesStore.getState().hasFetched).toBe(false);
			expect(useRoomsStore.getState().rooms).toEqual([]);
			expect(useRentPaymentsStore.getState().rentPayments).toEqual([]);
		});
	});
});
