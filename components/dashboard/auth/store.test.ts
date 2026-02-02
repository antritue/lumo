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

	it("updates user state", () => {
		const mockUser = { id: "123", email: "test@example.com" } as User;
		useAuthStore.getState().setUser(mockUser);

		expect(useAuthStore.getState().user).toEqual(mockUser);
	});

	it("updates loading state", () => {
		useAuthStore.getState().setLoading(false);

		expect(useAuthStore.getState().loading).toBe(false);
	});
});
