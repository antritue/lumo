import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeletePropertyDialog } from "./delete-property-dialog";
import type { Property } from "./types";

describe("DeletePropertyDialog", () => {
	const mockProperty: Property = { id: "1", name: "Sunset Villa" };
	const mockOnOpenChange = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("displays confirmation message with property name", () => {
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
				within(dialog).getByRole("heading", { name: /delete property/i }),
			).toBeInTheDocument();
			expect(within(dialog).getByText(/sunset villa/i)).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("deletes property on confirmation", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /delete property/i,
				}),
			);

			expect(mockOnDelete).toHaveBeenCalledWith("1");
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("closes dialog on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeletePropertyDialog
					property={mockProperty}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /cancel/i,
				}),
			);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			expect(mockOnDelete).not.toHaveBeenCalled();
		});
	});
});
