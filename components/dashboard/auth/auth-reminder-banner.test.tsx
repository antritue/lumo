import type { User } from "@supabase/supabase-js";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { AuthReminderBanner } from "./auth-reminder-banner";
import { useAuthStore } from "./store";

describe("AuthReminderBanner", () => {
	beforeEach(() => {
		useAuthStore.setState({
			user: null,
			loading: false,
			isAuthBannerDismissed: false,
		});
	});

	it("renders when user is not authenticated and not dismissed", () => {
		renderWithProviders(<AuthReminderBanner />);

		expect(
			screen.getByRole("heading", { name: /you’re not signed in/i }),
		).toBeInTheDocument();
		expect(
			screen.getByText(/sign in to save your data across devices/i),
		).toBeInTheDocument();
	});

	it("does not render when user is authenticated", () => {
		useAuthStore.setState({ user: { id: "123" } as unknown as User });

		renderWithProviders(<AuthReminderBanner />);

		expect(
			screen.queryByRole("heading", { name: /you’re not signed in/i }),
		).not.toBeInTheDocument();
	});

	it("does not render when dismissed", () => {
		useAuthStore.setState({ isAuthBannerDismissed: true });

		renderWithProviders(<AuthReminderBanner />);

		expect(
			screen.queryByRole("heading", { name: /you’re not signed in/i }),
		).not.toBeInTheDocument();
	});

	it("does not render while loading", () => {
		useAuthStore.setState({ loading: true });

		renderWithProviders(<AuthReminderBanner />);

		expect(
			screen.queryByRole("heading", { name: /you’re not signed in/i }),
		).not.toBeInTheDocument();
	});

	it("calls dismissAuthBanner when close button is clicked", async () => {
		const user = userEvent.setup();
		const dismissSpy = vi.fn();
		useAuthStore.setState({ dismissAuthBanner: dismissSpy });

		renderWithProviders(<AuthReminderBanner />);

		const closeButton = screen.getByRole("button", { name: /dismiss/i });
		await user.click(closeButton);

		expect(dismissSpy).toHaveBeenCalledTimes(1);
	});
});
