import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeleteRoomDialog } from "./delete-room-dialog";
import type { Room } from "./types";

describe("DeleteRoomDialog", () => {
	const mockRoom: Room = {
		id: "1",
		propertyId: "prop-1",
		name: "Master Bedroom",
		monthlyRent: 1500,
		notes: null,
	};
	const mockOnOpenChange = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("displays confirmation message with room name", () => {
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /delete/i }),
			).toBeInTheDocument();
			expect(within(dialog).getByText(/master bedroom/i)).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("deletes room on confirmation", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /delete/i,
				}),
			);

			expect(mockOnDelete).toHaveBeenCalledWith("1");
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("closes dialog on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
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
