import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
});
