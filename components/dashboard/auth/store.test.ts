import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./store";

describe("AuthStore", () => {
	beforeEach(() => {
		useAuthStore.setState({ user: null, loading: true });
	});

	it("initializes with null user and loading true", () => {
		const { user, loading } = useAuthStore.getState();
		expect(user).toBeNull();
		expect(loading).toBe(true);
	});

	it("initializes isAuthBannerDismissed as false by default", () => {
		expect(useAuthStore.getState().isAuthBannerDismissed).toBe(false);
	});

	it("updates user state", () => {
		const mockUser = { id: "123", email: "test@example.com" } as User;
		useAuthStore.getState().setUser(mockUser);

		expect(useAuthStore.getState().user).toEqual(mockUser);
	});

	it("updates loading state", () => {
		useAuthStore.getState().setLoading(false);

		expect(useAuthStore.getState().loading).toBe(false);
	});

	it("updates dismissal state", () => {
		useAuthStore.getState().dismissAuthBanner();

		expect(useAuthStore.getState().isAuthBannerDismissed).toBe(true);
	});

	it("clears all store data when clearStore is called", () => {
		const mockUser = { id: "123", email: "test@example.com" } as User;

		// Set some state
		useAuthStore.getState().setUser(mockUser);
		useAuthStore.getState().dismissAuthBanner();
		useAuthStore.getState().setLoading(false);

		// Verify state is set
		expect(useAuthStore.getState().user).toEqual(mockUser);
		expect(useAuthStore.getState().isAuthBannerDismissed).toBe(true);
		expect(useAuthStore.getState().loading).toBe(false);

		// Clear the store
		useAuthStore.getState().clearStore();

		// Verify all state is reset
		expect(useAuthStore.getState().user).toBeNull();
		expect(useAuthStore.getState().isAuthBannerDismissed).toBe(false);
		expect(useAuthStore.getState().loading).toBe(false);
	});
});
