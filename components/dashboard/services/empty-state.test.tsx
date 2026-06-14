import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EmptyState } from "./empty-state";
import { useServicesStore } from "./store";

describe("EmptyState", () => {
	beforeEach(() => {
		useServicesStore.setState({ services: [] });
		vi.restoreAllMocks();
	});

	it("displays empty state message and add button", () => {
		renderWithProviders(<EmptyState />);

		expect(
			screen.getByRole("heading", { name: /no services yet/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add service/i }),
		).toBeInTheDocument();
	});

	it("opens dialog when add button is clicked", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add service/i }));

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByPlaceholderText(/service name/i)).toBeInTheDocument();
	});

	it("creates first service and closes dialog on submit", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add service/i }));

		const input = screen.getByPlaceholderText(/service name/i);
		const saveButton = screen.getByRole("button", { name: /add service/i });

		await user.type(input, "Electricity");
		await user.click(saveButton);

		const { services } = useServicesStore.getState();
		expect(services).toHaveLength(1);
		expect(services[0].name).toBe("Electricity");

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});
