import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EditPropertyDialog } from "./edit-property-dialog";
import type { Property } from "./types";

describe("EditPropertyDialog", () => {
	const mockProperty: Property = {
		id: "prop-1",
		name: "Sunset Villa",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("does not display when closed", () => {
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={false}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("displays dialog with property name when open", () => {
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
			expect(
				within(dialog).getByRole("heading", { name: /edit property/i }),
			).toBeInTheDocument();

			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			expect(input).toHaveValue("Sunset Villa");
		});

		it("updates input when property changes", () => {
			const { rerender } = renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			expect(input).toHaveValue("Sunset Villa");

			// Rerender with different property
			const newProperty: Property = { id: "prop-2", name: "Ocean View" };
			rerender(
				<EditPropertyDialog
					property={newProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			expect(input).toHaveValue("Ocean View");
		});
	});

	describe("Form Validation", () => {
		it("disables save button when input is empty", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			// Clear the input
			await user.clear(input);

			expect(saveButton).toBeDisabled();
		});

		it("disables save button when input is only whitespace", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(input);
			await user.type(input, "   ");

			expect(saveButton).toBeDisabled();
		});

		it("enables save button when input has valid text", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(input);
			await user.type(input, "Updated Property");

			expect(saveButton).toBeEnabled();
		});
	});

	describe("Form Submission", () => {
		it("calls onSave with trimmed name when form is submitted", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(input);
			await user.type(input, "  Updated Villa  ");
			await user.click(saveButton);

			expect(mockOnSave).toHaveBeenCalledWith("prop-1", "Updated Villa");
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("does not call onSave when input is empty", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);

			await user.clear(input);
			// Try to submit with Enter key (save button is disabled, but test form validation)
			await user.type(input, "{Enter}");

			expect(mockOnSave).not.toHaveBeenCalled();
		});

		it("closes dialog when cancel button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const cancelButton = within(dialog).getByRole("button", {
				name: /cancel/i,
			});

			await user.click(cancelButton);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			expect(mockOnSave).not.toHaveBeenCalled();
		});
	});
});
