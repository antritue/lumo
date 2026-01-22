import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PropertyList } from "./property-list";
import { usePropertiesStore } from "./store";

describe("PropertyList", () => {
	beforeEach(() => {
		usePropertiesStore.setState({
			properties: [{ id: "1", name: "Test Property" }],
		});
	});

	describe("Display", () => {
		it("displays properties with add button", () => {
			usePropertiesStore.setState({
				properties: [
					{ id: "1", name: "Sunset Villa" },
					{ id: "2", name: "Ocean View" },
				],
			});

			renderWithProviders(<PropertyList />);

			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
			expect(screen.getByText("Ocean View")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add another property/i }),
			).toBeInTheDocument();
		});
	});

	describe("Adding Properties", () => {
		it("shows form, creates property, and hides form", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			await user.click(
				screen.getByRole("button", { name: /add another property/i }),
			);

			const input = screen.getByPlaceholderText(/property name or address/i);
			expect(input).toBeInTheDocument();

			await user.type(input, "New Villa");
			await user.click(screen.getByRole("button", { name: /add property/i }));

			expect(screen.getByText("New Villa")).toBeInTheDocument();
			expect(
				screen.queryByPlaceholderText(/property name or address/i),
			).not.toBeInTheDocument();
		});

		it("hides form when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			await user.click(
				screen.getByRole("button", { name: /add another property/i }),
			);
			await user.click(screen.getByRole("button", { name: /cancel/i }));

			expect(
				screen.queryByPlaceholderText(/property name or address/i),
			).not.toBeInTheDocument();
		});
	});

	describe("Editing Properties", () => {
		it("opens dialog, updates property, and closes", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			await user.click(screen.getByRole("button", { name: /edit/i }));

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);

			await user.clear(input);
			await user.type(input, "Updated Villa");
			await user.click(within(dialog).getByRole("button", { name: /save/i }));

			expect(screen.getByText("Updated Villa")).toBeInTheDocument();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
		it("opens dialog, deletes property, and closes", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			await user.click(screen.getByRole("button", { name: /delete/i }));

			const dialog = screen.getByRole("dialog");
			await user.click(
				within(dialog).getByRole("button", { name: /delete property/i }),
			);

			expect(screen.queryByText("Sunset Villa")).not.toBeInTheDocument();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

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
