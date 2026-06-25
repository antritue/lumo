import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import type { Room } from "./types";
import { UpsertRoomDialog } from "./upsert-room-dialog";

describe("UpsertRoomDialog", () => {
	const mockRoom: Room = {
		id: "room-1",
		propertyId: "prop-1",
		name: "Room 101",
		monthlyRent: 500,
		notes: "Corner unit",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("Add mode", () => {
		it("displays dialog with empty inputs and add button", () => {
			renderWithProviders(
				<UpsertRoomDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /add room/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("textbox", { name: /room name/i }),
			).toHaveValue("");
			expect(
				within(dialog).getByRole("spinbutton", { name: /monthly rent/i }),
			).toHaveValue(null);
			expect(
				within(dialog).getByRole("textbox", { name: /notes/i }),
			).toHaveValue("");
			expect(
				within(dialog).getByRole("button", { name: /add room/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("button", { name: /cancel/i }),
			).toBeInTheDocument();
		});

		it("disables submit button for empty or whitespace input", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRoomDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });
			const submitButton = within(dialog).getByRole("button", {
				name: /add room/i,
			});

			expect(submitButton).toBeDisabled();

			await user.type(input, "   ");
			expect(submitButton).toBeDisabled();

			await user.clear(input);
			await user.type(input, "Room 102");
			expect(submitButton).toBeEnabled();
		});

		it("calls onSave with null id, name, and optional fields on submit", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRoomDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });
			const rentInput = within(dialog).getByRole("spinbutton", {
				name: /monthly rent/i,
			});
			const notesInput = within(dialog).getByRole("textbox", {
				name: /notes/i,
			});
			const form = dialog.querySelector("form") as HTMLFormElement;

			await user.type(input, "  Room 102  ");
			fireEvent.change(rentInput, { target: { value: "750" } });
			await user.type(notesInput, "Second floor");
			fireEvent.submit(form);

			expect(mockOnSave).toHaveBeenCalledWith(
				null,
				"Room 102",
				750,
				"Second floor",
			);
		});

		it("calls onSave with null rent and notes when optional fields are empty", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRoomDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });

			await user.type(input, "Room 103");
			await user.click(
				within(dialog).getByRole("button", { name: /add room/i }),
			);

			expect(mockOnSave).toHaveBeenCalledWith(null, "Room 103", null, null);
		});

		it("shows loader during submission", async () => {
			const user = userEvent.setup();
			mockOnSave.mockImplementation(() => new Promise(() => {}));

			renderWithProviders(
				<UpsertRoomDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });

			await user.type(input, "Room 104");
			await user.click(
				within(dialog).getByRole("button", { name: /add room/i }),
			);

			expect(screen.getByTestId("room-upsert-loader")).toBeInTheDocument();
		});

		it("shows error dialog on failure", async () => {
			const user = userEvent.setup();
			mockOnSave.mockRejectedValue(new Error("API error"));

			renderWithProviders(
				<UpsertRoomDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });

			await user.type(input, "Room 105");
			await user.click(
				within(dialog).getByRole("button", { name: /add room/i }),
			);

			expect(
				await screen.findByText(/failed to add room/i),
			).toBeInTheDocument();
		});

		it("calls onOpenChange(false) on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRoomDialog
					mode="add"
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

	describe("Edit mode", () => {
		it("displays dialog with pre-filled values and save button", () => {
			renderWithProviders(
				<UpsertRoomDialog
					mode="edit"
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /edit room/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("textbox", { name: /room name/i }),
			).toHaveValue("Room 101");
			expect(
				within(dialog).getByRole("spinbutton", { name: /monthly rent/i }),
			).toHaveValue(500);
			expect(
				within(dialog).getByRole("textbox", { name: /notes/i }),
			).toHaveValue("Corner unit");
			expect(
				within(dialog).getByRole("button", { name: /save/i }),
			).toBeInTheDocument();
		});

		it("disables save button for empty or whitespace input", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRoomDialog
					mode="edit"
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(input);
			expect(saveButton).toBeDisabled();

			await user.type(input, "   ");
			expect(saveButton).toBeDisabled();

			await user.clear(input);
			await user.type(input, "Updated Room");
			expect(saveButton).toBeEnabled();
		});

		it("calls onSave with room id, trimmed name, and optional fields", async () => {
			renderWithProviders(
				<UpsertRoomDialog
					mode="edit"
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });
			const rentInput = within(dialog).getByRole("spinbutton", {
				name: /monthly rent/i,
			});
			const notesInput = within(dialog).getByRole("textbox", {
				name: /notes/i,
			});
			const form = dialog.querySelector("form") as HTMLFormElement;

			fireEvent.change(input, { target: { value: "  Room 201  " } });
			fireEvent.change(rentInput, { target: { value: "850" } });
			fireEvent.change(notesInput, { target: { value: "Updated notes" } });
			fireEvent.submit(form);

			expect(mockOnSave).toHaveBeenCalledWith(
				"room-1",
				"Room 201",
				850,
				"Updated notes",
			);
			await act(async () => {});
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("passes null rent when cleared in edit mode", async () => {
			renderWithProviders(
				<UpsertRoomDialog
					mode="edit"
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });
			const rentInput = within(dialog).getByRole("spinbutton", {
				name: /monthly rent/i,
			});
			const form = dialog.querySelector("form") as HTMLFormElement;

			fireEvent.change(input, { target: { value: "Room 201" } });
			fireEvent.change(rentInput, { target: { value: "" } });
			fireEvent.submit(form);

			expect(mockOnSave).toHaveBeenCalledWith(
				"room-1",
				"Room 201",
				null,
				"Corner unit",
			);
		});

		it("calls onOpenChange(false) on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRoomDialog
					mode="edit"
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

		it("shows error dialog on update failure", async () => {
			const user = userEvent.setup();
			mockOnSave.mockRejectedValue(new Error("API error"));

			renderWithProviders(
				<UpsertRoomDialog
					mode="edit"
					room={mockRoom}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByRole("textbox", { name: /room name/i });
			const form = dialog.querySelector("form") as HTMLFormElement;

			await user.clear(input);
			await user.type(input, "Updated Room");
			fireEvent.submit(form);

			expect(
				await screen.findByText(/failed to update room/i),
			).toBeInTheDocument();
		});
	});
});
