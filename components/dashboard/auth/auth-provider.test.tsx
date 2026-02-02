import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
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

		render(
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

		render(
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
});
