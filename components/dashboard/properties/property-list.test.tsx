import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PropertyList } from "./property-list";
import { usePropertiesStore } from "./store";

describe("PropertyList", () => {
	beforeEach(() => {
		usePropertiesStore.setState({
			properties: [{ id: "1", name: "Test Property", userId: "test-user-id" }],
		});
		vi.restoreAllMocks();
	});

	describe("Display", () => {
		it("displays properties with add button", () => {
			usePropertiesStore.setState({
				properties: [
					{ id: "1", name: "Sunset Villa", userId: "test-user-id" },
					{ id: "2", name: "Ocean View", userId: "test-user-id" },
				],
			});

			renderWithProviders(<PropertyList />);

			expect(screen.getAllByText("Sunset Villa").length).toBeGreaterThanOrEqual(
				1,
			);
			expect(screen.getAllByText("Ocean View").length).toBeGreaterThanOrEqual(
				1,
			);
			expect(
				screen.getAllByRole("button", { name: /add property/i }).length,
			).toBeGreaterThanOrEqual(1);
		});
	});

	describe("Adding Properties", () => {
		it("opens dialog on add click", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			await user.click(
				screen.getAllByRole("button", { name: /add property/i })[0],
			);

			expect(
				screen.getByRole("textbox", { name: /property name/i }),
			).toBeInTheDocument();
		});

		it("closes dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			await user.click(
				screen.getAllByRole("button", { name: /add property/i })[0],
			);
			await user.click(screen.getByRole("button", { name: /cancel/i }));

			expect(
				screen.queryByRole("textbox", { name: /property name/i }),
			).not.toBeInTheDocument();
		});
	});

	describe("Editing Properties", () => {
		it("opens dialog with item data for editing", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "1", name: "Sunset Villa", userId: "test-user-id" }],
			});

			renderWithProviders(<PropertyList />);

			await user.click(screen.getByRole("button", { name: /edit/i }));

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("textbox", { name: /property name/i }),
			).toHaveValue("Sunset Villa");
			expect(
				within(dialog).getByRole("button", { name: /save/i }),
			).toBeEnabled();
		});

		it("closes dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			await user.click(screen.getByRole("button", { name: /edit/i }));
			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /cancel/i,
				}),
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	describe("Deleting Properties", () => {
		it("closes dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			await user.click(screen.getByRole("button", { name: /delete/i }));
			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /cancel/i,
				}),
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});
});
