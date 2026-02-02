import type { User } from "@supabase/supabase-js";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "./store";
import { useAuth } from "./use-auth";

vi.mock("@/lib/supabase", () => ({
	supabase: {
		auth: {
			signInWithOAuth: vi.fn(),
			signOut: vi.fn(),
		},
	},
}));

describe("useAuth", () => {
	it("returns user and loading state from store", () => {
		const mockUser = { id: "123", email: "test@example.com" } as User;
		useAuthStore.setState({ user: mockUser, loading: false });

		const { result } = renderHook(() => useAuth());

		expect(result.current.user).toEqual(mockUser);
		expect(result.current.loading).toBe(false);
	});

	it("calls signInWithOAuth with correct parameters", async () => {
		const mockSignIn = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(supabase.auth.signInWithOAuth).mockImplementation(mockSignIn);

		const { result } = renderHook(() => useAuth());
		await result.current.signInWithGoogle();

		expect(mockSignIn).toHaveBeenCalledWith({
			provider: "google",
			options: {
				redirectTo: expect.stringContaining("/api/auth/callback"),
				queryParams: {
					prompt: "select_account",
				},
			},
		});
	});

	it("calls signOut when signOut is invoked", async () => {
		const mockSignOut = vi.fn().mockResolvedValue({ error: null });
		vi.mocked(supabase.auth.signOut).mockImplementation(mockSignOut);

		const { result } = renderHook(() => useAuth());
		await result.current.signOut();

		expect(mockSignOut).toHaveBeenCalled();
	});
});
