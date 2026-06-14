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

	it("opens dialog when add button is clicked", async () => {
		const user = userEvent.setup();

		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add property/i }));

		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("creates property and closes dialog on submit", async () => {
		const user = userEvent.setup();

		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add property/i }));

		const dialog = screen.getByRole("dialog");
		const input = within(dialog).getByPlaceholderText(
			/property name or address/i,
		);
		const saveButton = within(dialog).getByRole("button", {
			name: /add property/i,
		});

		await user.type(input, "New Property");
		await user.click(saveButton);

		const { properties } = usePropertiesStore.getState();
		expect(properties).toHaveLength(1);
		expect(properties[0].name).toBe("New Property");
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});
