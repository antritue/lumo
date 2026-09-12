import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { supabase } from "@/lib/supabase";
import { renderWithProviders } from "@/test/render";
import { AuthProvider } from "./auth-provider";
import { clearAllDomainStores } from "./clear-domain-stores";
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

vi.mock("./clear-domain-stores", () => ({
	clearAllDomainStores: vi.fn(),
}));

let authCallback:
	| ((event: AuthChangeEvent, session: Session | null) => void)
	| undefined;

function mockAuthStateChange() {
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
}

function render(session: Session | null = null) {
	vi.mocked(supabase.auth.getSession).mockResolvedValue({
		data: { session } as { session: Session },
		error: null,
	});

	return renderWithProviders(
		<AuthProvider>
			<div>Child</div>
		</AuthProvider>,
	);
}

describe("AuthProvider", () => {
	it("initializes auth state from session on mount", async () => {
		const mockUser = { id: "123", email: "test@example.com" } as User;
		render({ user: mockUser } as Session);

		await waitFor(() => {
			expect(useAuthStore.getState().user).toEqual(mockUser);
			expect(useAuthStore.getState().loading).toBe(false);
		});
	});

	it("sets loading false even without a session", async () => {
		render(null);

		await waitFor(() => {
			expect(useAuthStore.getState().user).toBeNull();
			expect(useAuthStore.getState().loading).toBe(false);
		});
	});

	describe("onAuthStateChange", () => {
		it("clears stores on SIGNED_OUT", async () => {
			mockAuthStateChange();
			render();

			authCallback?.("SIGNED_OUT", null);

			expect(clearAllDomainStores).toHaveBeenCalledTimes(1);
			expect(useAuthStore.getState().user).toBeNull();
		});

		it("clears guest data on guest → user transition", async () => {
			mockAuthStateChange();
			render();

			const mockUser = { id: "123" } as User;
			authCallback?.("SIGNED_IN", { user: mockUser } as Session);

			expect(clearAllDomainStores).toHaveBeenCalledTimes(1);
			await waitFor(() => {
				expect(useAuthStore.getState().user).toEqual(mockUser);
			});
		});

		it("does not clear stores on token refresh", async () => {
			mockAuthStateChange();
			const existingUser = { id: "123" } as User;
			render({ user: existingUser } as Session);

			await waitFor(() => {
				expect(useAuthStore.getState().user).toEqual(existingUser);
			});
			vi.mocked(clearAllDomainStores).mockClear();

			authCallback?.("SIGNED_IN", { user: existingUser } as Session);

			expect(clearAllDomainStores).not.toHaveBeenCalled();
		});

		it("sets user on INITIAL_SESSION", async () => {
			mockAuthStateChange();
			render();

			const mockUser = { id: "123" } as User;
			authCallback?.("INITIAL_SESSION", { user: mockUser } as Session);

			await waitFor(() => {
				expect(useAuthStore.getState().user).toEqual(mockUser);
				expect(useAuthStore.getState().loading).toBe(false);
			});
		});
	});
});
