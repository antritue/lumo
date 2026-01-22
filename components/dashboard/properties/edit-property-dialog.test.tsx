import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EditPropertyDialog } from "./edit-property-dialog";
import type { Property } from "./types";

describe("EditPropertyDialog", () => {
	const mockProperty: Property = {
		id: "1",
		name: "Sunset Villa",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("displays dialog with property name", () => {
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /edit property/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByPlaceholderText(/property name or address/i),
			).toHaveValue("Sunset Villa");
		});
	});

	describe("Validation", () => {
		it("disables save button for invalid input", async () => {
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

			// Empty input
			await user.clear(input);
			expect(saveButton).toBeDisabled();

			// Whitespace only
			await user.type(input, "   ");
			expect(saveButton).toBeDisabled();

			// Valid input
			await user.clear(input);
			await user.type(input, "Updated Property");
			expect(saveButton).toBeEnabled();
		});
	});

	describe("Interactions", () => {
		it("saves property with trimmed name", async () => {
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
			await user.type(input, "  Updated Villa  ");
			await user.click(within(dialog).getByRole("button", { name: /save/i }));

			expect(mockOnSave).toHaveBeenCalledWith("1", "Updated Villa");
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("closes dialog without saving on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditPropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /cancel/i,
				}),
			);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			expect(mockOnSave).not.toHaveBeenCalled();
		});
	});
});
