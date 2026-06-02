import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

	describe("Display", () => {
		it("populates form with room data", () => {
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onSave={vi.fn()}
				/>,
			);

			expect(screen.getByDisplayValue("Master Bedroom")).toBeInTheDocument();
			expect(screen.getByDisplayValue("1500")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Corner unit")).toBeInTheDocument();
		});
	});

	describe("Form Validation", () => {
		it("disables save button for invalid input", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onSave={vi.fn()}
				/>,
			);

			const saveButton = screen.getByRole("button", { name: /save/i });
			const input = screen.getByDisplayValue("Master Bedroom");

			await user.clear(input);
			expect(saveButton).toBeDisabled();

			await user.type(input, "   ");
			expect(saveButton).toBeDisabled();

			await user.clear(input);
			await user.type(input, "Updated Room");
			expect(saveButton).toBeEnabled();
		});
	});

	describe("Interactions", () => {
		it("closes dialog on cancel", async () => {
			const user = userEvent.setup();
			const onOpenChange = vi.fn();
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={onOpenChange}
					onSave={vi.fn()}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /cancel/i }));
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});

		it("saves with correct arguments and shows loading state", async () => {
			const onSave = vi.fn();
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onSave={onSave}
				/>,
			);

			const form = screen.getByRole("dialog").querySelector("form");
			if (!form) throw new Error("Form not found");
			fireEvent.submit(form);
			expect(onSave).toHaveBeenCalledWith(
				"1",
				"Master Bedroom",
				1500,
				"Corner unit",
			);
			expect(screen.getByTestId("room-edit-loader")).toBeInTheDocument();
			expect(
				screen.queryByDisplayValue("Master Bedroom"),
			).not.toBeInTheDocument();
		});

		it("shows error dialog on save failure and restores form", async () => {
			const onSave = vi.fn().mockRejectedValue(new Error("API error"));
			renderWithProviders(
				<EditRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onSave={onSave}
				/>,
			);

			const form = screen.getByRole("dialog").querySelector("form");
			if (!form) throw new Error("Form not found");
			fireEvent.submit(form);
			expect(
				await screen.findByText(/problem updating this room/i),
			).toBeInTheDocument();
			expect(screen.getByDisplayValue("Master Bedroom")).toBeInTheDocument();
		});
	});
});
