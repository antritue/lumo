import type { User } from "@supabase/supabase-js";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useBillingStore } from "@/components/dashboard/billing/store";
import { renderWithProviders } from "@/test/render";
import SettingsPage from "./page";

const { mockPush, mockRefresh, mockDeleteAccount, mockSignOut } = vi.hoisted(
	() => ({
		mockPush: vi.fn(),
		mockRefresh: vi.fn(),
		mockDeleteAccount: vi.fn(),
		mockSignOut: vi.fn(),
	}),
);

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("@/components/dashboard/settings/store", () => ({
	useSettingsStore: (
		selector: (s: { deleteAccount: typeof mockDeleteAccount }) => unknown,
	) => selector({ deleteAccount: mockDeleteAccount }),
}));

vi.mock("@/lib/supabase", () => ({
	supabase: { auth: { signOut: mockSignOut } },
}));

describe("SettingsPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDeleteAccount.mockResolvedValue(undefined);
		mockSignOut.mockResolvedValue({ error: null });
		useAuthStore.setState({
			user: {
				id: "user-1",
				app_metadata: {},
				user_metadata: {},
				aud: "authenticated",
				created_at: "2024-01-01T00:00:00Z",
			} as User,
			loading: false,
		});
		useBillingStore.setState({
			status: null,
			isStatusLoading: false,
			hasStatusFetched: false,
			isStatusFetchFailed: false,
			isCheckoutLoading: false,
			fetchStatus: vi.fn(),
		});
	});

	it("renders title and signs out after account deletion", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SettingsPage />);

		expect(
			screen.getByRole("heading", { name: /settings/i }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /delete account/i }));

		const input = screen.getByTestId("delete-confirm-input");
		await user.type(input, "DELETE");

		await user.click(screen.getByRole("button", { name: /delete account/i }));

		expect(mockDeleteAccount).toHaveBeenCalledOnce();
		expect(mockSignOut).toHaveBeenCalledOnce();
		expect(mockPush).toHaveBeenCalledWith("/");
		expect(mockRefresh).toHaveBeenCalledOnce();
	});

	it("renders the billing card with the current plan", () => {
		useBillingStore.setState({
			status: { tier: null, isPaid: false, roomLimit: 5, roomCount: 3 },
			hasStatusFetched: true,
		});

		renderWithProviders(<SettingsPage />);

		expect(screen.getByText("Plan")).toBeInTheDocument();
		expect(screen.getByText("Free")).toBeInTheDocument();
		expect(screen.getByText("3 of 5 rooms used")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /upgrade/i }),
		).toBeInTheDocument();
	});
});
