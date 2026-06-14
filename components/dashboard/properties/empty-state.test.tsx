import { useAuthStore } from "@/components/dashboard/auth/store";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EmptyState } from "./empty-state";
import { usePropertiesStore } from "./store";

describe("EmptyState", () => {
	beforeEach(() => {
		usePropertiesStore.setState({ properties: [] });
		vi.restoreAllMocks();
	});

	it("displays empty state message and add button", () => {
		renderWithProviders(<EmptyState />);

		expect(
			screen.getByRole("heading", { name: /no properties yet/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add property/i }),
		).toBeInTheDocument();
	});

	it("opens dialog with input when add button is clicked", async () => {
		const user = userEvent.setup();

		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add property/i }));

		const dialog = screen.getByRole("dialog");
		expect(
			within(dialog).getByPlaceholderText(/property name or address/i),
		).toBeInTheDocument();
	});

	it("creates first property when user submits via dialog", async () => {
		const user = userEvent.setup();

		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ id: 1, name: "Sunset Villa" }),
			}),
		) as unknown as typeof fetch;

		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add property/i }));

		const dialog = screen.getByRole("dialog");
		const input = within(dialog).getByPlaceholderText(
			/property name or address/i,
		);

		await user.type(input, "Sunset Villa");
		await user.click(
			within(dialog).getByRole("button", { name: /add property/i }),
		);

		const { properties } = usePropertiesStore.getState();
		expect(properties).toHaveLength(1);
		expect(properties[0].name).toBe("Sunset Villa");
	});

	it("disables submit button when input is empty", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add property/i }));

		const dialog = screen.getByRole("dialog");
		const submitButton = within(dialog).getByRole("button", {
			name: /add property/i,
		});
		expect(submitButton).toBeDisabled();
	});

	it("enables submit button when user enters text", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add property/i }));

		const dialog = screen.getByRole("dialog");
		const input = within(dialog).getByPlaceholderText(
			/property name or address/i,
		);
		const submitButton = within(dialog).getByRole("button", {
			name: /add property/i,
		});

		expect(submitButton).toBeDisabled();

		await user.type(input, "New Property");

		expect(submitButton).toBeEnabled();
	});

	it("shows loader during submission", async () => {
		const user = userEvent.setup();

		// Make fetch never resolve so the dialog stays in submitting state
		global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
		useAuthStore.setState({
			user: {} as any,
			loading: false,
		});

		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add property/i }));

		const dialog = screen.getByRole("dialog");
		const input = within(dialog).getByPlaceholderText(
			/property name or address/i,
		);
		const submitButton = within(dialog).getByRole("button", {
			name: /add property/i,
		});

		await user.type(input, "Test Property");
		await user.click(submitButton);

		expect(screen.getByTestId("property-upsert-loader")).toBeInTheDocument();
	});
});
