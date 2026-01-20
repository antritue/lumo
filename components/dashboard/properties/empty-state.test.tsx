import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EmptyState } from "./empty-state";
import { usePropertiesStore } from "./store";

describe("EmptyState", () => {
	beforeEach(() => {
		usePropertiesStore.setState({ properties: [] });
	});

	it("displays empty state message and creation form", () => {
		renderWithProviders(<EmptyState />);

		expect(
			screen.getByRole("heading", { name: /no properties yet/i }),
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText(/property name or address/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add property/i }),
		).toBeInTheDocument();
	});

	it("creates first property when user submits form", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		const input = screen.getByPlaceholderText(/property name or address/i);
		const submitButton = screen.getByRole("button", { name: /add property/i });

		await user.type(input, "Sunset Villa");
		await user.click(submitButton);

		const { properties } = usePropertiesStore.getState();
		expect(properties).toHaveLength(1);
		expect(properties[0].name).toBe("Sunset Villa");
	});

	it("disables submit button when input is empty", () => {
		renderWithProviders(<EmptyState />);

		const submitButton = screen.getByRole("button", { name: /add property/i });
		expect(submitButton).toBeDisabled();
	});

	it("enables submit button when user enters text", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		const input = screen.getByPlaceholderText(/property name or address/i);
		const submitButton = screen.getByRole("button", { name: /add property/i });

		expect(submitButton).toBeDisabled();

		await user.type(input, "New Property");

		expect(submitButton).toBeEnabled();
	});

	it("clears input after successful submission", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		const input = screen.getByPlaceholderText(/property name or address/i);
		const submitButton = screen.getByRole("button", { name: /add property/i });

		await user.type(input, "Test Property");
		await user.click(submitButton);

		expect(input).toHaveValue("");
	});
});
