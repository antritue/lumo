import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PropertyList } from "./property-list";
import { usePropertiesStore } from "./store";

describe("PropertyList", () => {
	beforeEach(() => {
		usePropertiesStore.setState({
			properties: [{ id: "prop-1", name: "Test Property" }],
		});
	});

	describe("Display", () => {
		it("displays list title", () => {
			renderWithProviders(<PropertyList />);

			expect(
				screen.getByRole("heading", { name: /your properties/i }),
			).toBeInTheDocument();
		});

		it("displays add another property button", () => {
			renderWithProviders(<PropertyList />);

			expect(
				screen.getByRole("button", { name: /add another property/i }),
			).toBeInTheDocument();
		});

		it("displays multiple properties", () => {
			usePropertiesStore.setState({
				properties: [
					{ id: "prop-1", name: "Sunset Villa" },
					{ id: "prop-2", name: "Ocean View" },
					{ id: "prop-3", name: "Mountain Retreat" },
				],
			});

			renderWithProviders(<PropertyList />);

			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
			expect(screen.getByText("Ocean View")).toBeInTheDocument();
			expect(screen.getByText("Mountain Retreat")).toBeInTheDocument();
		});
	});

	describe("Adding Properties", () => {
		it("shows creation form when add another button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			const addButton = screen.getByRole("button", {
				name: /add another property/i,
			});
			await user.click(addButton);

			expect(
				screen.getByPlaceholderText(/property name or address/i),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add property/i }),
			).toBeInTheDocument();
		});

		it("hides creation form when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			// Show form
			const addButton = screen.getByRole("button", {
				name: /add another property/i,
			});
			await user.click(addButton);

			// Cancel
			const cancelButton = screen.getByRole("button", { name: /cancel/i });
			await user.click(cancelButton);

			// Form should be hidden, add button should be back
			expect(
				screen.queryByPlaceholderText(/property name or address/i),
			).not.toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add another property/i }),
			).toBeInTheDocument();
		});

		it("creates property and hides form on submission", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyList />);

			// Show form
			const addButton = screen.getByRole("button", {
				name: /add another property/i,
			});
			await user.click(addButton);

			// Fill and submit
			const input = screen.getByPlaceholderText(/property name or address/i);
			const submitButton = screen.getByRole("button", {
				name: /add property/i,
			});

			await user.type(input, "New Villa");
			await user.click(submitButton);

			// Property should be created
			expect(screen.getByText("New Villa")).toBeInTheDocument();

			// Form should be hidden
			expect(
				screen.queryByPlaceholderText(/property name or address/i),
			).not.toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add another property/i }),
			).toBeInTheDocument();
		});
	});

	describe("Editing Properties", () => {
		it("opens edit dialog when edit button is clicked", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "prop-1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Dialog should open
			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
			expect(
				within(dialog).getByRole("heading", { name: /edit property/i }),
			).toBeInTheDocument();
		});

		it("closes edit dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "prop-1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			// Open dialog
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Close dialog
			const dialog = screen.getByRole("dialog");
			const cancelButton = within(dialog).getByRole("button", {
				name: /cancel/i,
			});
			await user.click(cancelButton);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("updates property when save is clicked in edit dialog", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "prop-1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			// Open dialog
			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			// Edit and save
			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(input);
			await user.type(input, "Updated Villa");
			await user.click(saveButton);

			// Property should be updated
			expect(screen.getByText("Updated Villa")).toBeInTheDocument();
			expect(screen.queryByText("Sunset Villa")).not.toBeInTheDocument();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	describe("Deleting Properties", () => {
		it("opens delete dialog when delete button is clicked", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "prop-1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			const deleteButton = screen.getByRole("button", { name: /delete/i });
			await user.click(deleteButton);

			// Dialog should open
			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
			expect(
				within(dialog).getByRole("heading", { name: /delete property/i }),
			).toBeInTheDocument();
		});

		it("closes delete dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "prop-1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			// Open dialog
			const deleteButton = screen.getByRole("button", { name: /delete/i });
			await user.click(deleteButton);

			// Close dialog
			const dialog = screen.getByRole("dialog");
			const cancelButton = within(dialog).getByRole("button", {
				name: /cancel/i,
			});
			await user.click(cancelButton);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("deletes property when delete is confirmed", async () => {
			const user = userEvent.setup();
			usePropertiesStore.setState({
				properties: [{ id: "prop-1", name: "Sunset Villa" }],
			});

			renderWithProviders(<PropertyList />);

			// Open dialog
			const deleteButton = screen.getByRole("button", { name: /delete/i });
			await user.click(deleteButton);

			// Confirm deletion
			const dialog = screen.getByRole("dialog");
			const confirmButton = within(dialog).getByRole("button", {
				name: /delete property/i,
			});
			await user.click(confirmButton);

			// Property should be deleted
			expect(screen.queryByText("Sunset Villa")).not.toBeInTheDocument();
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});
});
