import type { User } from "@supabase/supabase-js";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { renderWithProviders } from "@/test/render";
import FeedbackPage from "./page";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("FeedbackPage", () => {
	beforeEach(() => {
		useAuthStore.setState({ user: null, loading: false });
		vi.clearAllMocks();
	});

	it("pre-fills name and email when user is authenticated", () => {
		useAuthStore.setState({
			user: {
				id: "user-1",
				email: "john@example.com",
				user_metadata: { full_name: "John Doe" },
				app_metadata: {},
				aud: "authenticated",
				created_at: "2024-01-01T00:00:00Z",
			} as User,
		});

		renderWithProviders(<FeedbackPage />);

		expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
		expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
	});

	it("shows error dialog when API returns non-ok response", async () => {
		const user = userEvent.setup();
		mockFetch.mockResolvedValue({ ok: false });

		renderWithProviders(<FeedbackPage />);

		await user.type(screen.getByLabelText(/name/i), "John");
		await user.type(screen.getByLabelText(/email/i), "john@test.com");
		await user.type(screen.getByLabelText(/message/i), "Test feedback");
		await user.click(screen.getByRole("button", { name: /send feedback/i }));

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: /failed to send feedback/i }),
			).toBeInTheDocument();
		});
	});

	it("shows thank-you dialog and hides error dialog on successful submission", async () => {
		const user = userEvent.setup();
		mockFetch.mockResolvedValue({ ok: true });

		renderWithProviders(<FeedbackPage />);

		await user.type(screen.getByLabelText(/name/i), "John");
		await user.type(screen.getByLabelText(/email/i), "john@test.com");
		await user.type(screen.getByLabelText(/message/i), "Great app!");
		await user.click(screen.getByRole("button", { name: /send feedback/i }));

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: /thank you/i }),
			).toBeInTheDocument();
		});
	});

	it("calls fetch with correct payload on submit", async () => {
		const user = userEvent.setup();
		mockFetch.mockResolvedValue({ ok: true });

		renderWithProviders(<FeedbackPage />);

		await user.type(screen.getByLabelText(/name/i), "Jane");
		await user.type(screen.getByLabelText(/email/i), "jane@test.com");
		await user.click(screen.getByRole("radio", { name: /feature request/i }));
		await user.type(screen.getByLabelText(/message/i), "Would love dark mode");
		await user.click(screen.getByRole("button", { name: /send feedback/i }));

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/feedback",
				expect.objectContaining({
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						name: "Jane",
						email: "jane@test.com",
						type: "feature",
						message: "Would love dark mode",
					}),
				}),
			);
		});
	});

	it("resets form when 'send another' is clicked", async () => {
		const user = userEvent.setup();
		mockFetch.mockResolvedValue({ ok: true });

		renderWithProviders(<FeedbackPage />);

		await user.type(screen.getByLabelText(/name/i), "John");
		await user.type(screen.getByLabelText(/email/i), "john@test.com");
		await user.type(screen.getByLabelText(/message/i), "Test");
		await user.click(screen.getByRole("button", { name: /send feedback/i }));

		await waitFor(() => {
			expect(
				screen.getByRole("heading", { name: /thank you/i }),
			).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: /send another/i }));

		expect(
			screen.queryByRole("heading", { name: /thank you/i }),
		).not.toBeInTheDocument();
		expect(screen.getByLabelText(/message/i)).toHaveValue("");
	});
});
