import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeletePropertyDialog } from "./delete-property-dialog";
import type { Property } from "./types";

describe("DeletePropertyDialog", () => {
	const mockProperty: Property = {
		id: "prop-1",
		name: "Sunset Villa",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("does not display when closed", () => {
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={false}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("does not display when property is null", () => {
			renderWithProviders(
				<DeletePropertyDialog
					property={null}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("displays dialog with confirmation message when open", () => {
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
			expect(
				within(dialog).getByRole("heading", { name: /delete property/i }),
			).toBeInTheDocument();

			// Check that property name appears in the message
			expect(within(dialog).getByText(/sunset villa/i)).toBeInTheDocument();
		});

		it("displays cancel and delete buttons", () => {
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("button", { name: /cancel/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("button", { name: /delete property/i }),
			).toBeInTheDocument();
		});

		it("displays warning icon", () => {
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const heading = within(dialog).getByRole("heading", {
				name: /delete property/i,
			});

			// Check that the heading contains an icon (lucide-react AlertTriangle renders as svg)
			expect(heading.querySelector("svg")).toBeInTheDocument();
		});
	});

	describe("Delete Confirmation", () => {
		it("calls onDelete with property id when delete button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const deleteButton = within(dialog).getByRole("button", {
				name: /delete property/i,
			});

			await user.click(deleteButton);

			expect(mockOnDelete).toHaveBeenCalledWith("prop-1");
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("closes dialog when cancel button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const cancelButton = within(dialog).getByRole("button", {
				name: /cancel/i,
			});

			await user.click(cancelButton);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			expect(mockOnDelete).not.toHaveBeenCalled();
		});
	});
});
