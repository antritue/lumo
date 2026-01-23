import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EditRoomDialog } from "./edit-room-dialog";
import type { Room } from "./types";

describe("EditRoomDialog", () => {
	const mockRoom: Room = {
		id: "1",
		propertyId: "prop-1",
		name: "Master Bedroom",
		monthlyRent: 1500,
		notes: "Corner unit",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("populates form with room data", () => {
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByDisplayValue("Master Bedroom"),
			).toBeInTheDocument();
			expect(within(dialog).getByDisplayValue("1500")).toBeInTheDocument();
			expect(
				within(dialog).getByDisplayValue("Corner unit"),
			).toBeInTheDocument();
		});
	});

	describe("Form Validation", () => {
		it("disables save button for invalid input", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByDisplayValue("Master Bedroom");
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			// Empty input
			await user.clear(input);
			expect(saveButton).toBeDisabled();

			// Whitespace only
			await user.type(input, "   ");
			expect(saveButton).toBeDisabled();

			// Valid input
			await user.clear(input);
			await user.type(input, "Updated Room");
			expect(saveButton).toBeEnabled();
		});
	});

	describe("Interactions", () => {
		it("closes dialog on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
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
