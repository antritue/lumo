import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import type { Property } from "./types";
import { UpsertPropertyDialog } from "./upsert-property-dialog";

describe("UpsertPropertyDialog", () => {
	const mockProperty: Property = {
		id: "1",
		name: "Sunset Villa",
		userId: "test-user-id",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe("Add mode", () => {
		it("displays dialog with empty input and add button", () => {
			renderWithProviders(
				<UpsertPropertyDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /add property/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByPlaceholderText(/property name or address/i),
			).toHaveValue("");
			expect(
				within(dialog).getByRole("button", { name: /add property/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("button", { name: /cancel/i }),
			).toBeInTheDocument();
		});

		it("disables submit button for empty or whitespace input", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertPropertyDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);
			const submitButton = within(dialog).getByRole("button", {
				name: /add property/i,
			});

			expect(submitButton).toBeDisabled();

			await user.type(input, "   ");
			expect(submitButton).toBeDisabled();

			await user.clear(input);
			await user.type(input, "New Property");
			expect(submitButton).toBeEnabled();
		});

		it("calls onSave with null id and trimmed name on submit", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertPropertyDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);

			await user.type(input, "  New Villa  ");
			await user.click(
				within(dialog).getByRole("button", { name: /add property/i }),
			);

			expect(mockOnSave).toHaveBeenCalledWith(null, "New Villa");
		});

		it("shows loader during submission", async () => {
			const user = userEvent.setup();
			mockOnSave.mockImplementation(() => new Promise(() => {}));

			renderWithProviders(
				<UpsertPropertyDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);

			await user.type(input, "New Villa");
			await user.click(
				within(dialog).getByRole("button", { name: /add property/i }),
			);

			expect(screen.getByTestId("property-upsert-loader")).toBeInTheDocument();
		});

		it("shows error dialog on failure", async () => {
			const user = userEvent.setup();
			mockOnSave.mockRejectedValue(new Error("API error"));

			renderWithProviders(
				<UpsertPropertyDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(
				/property name or address/i,
			);

			await user.type(input, "New Villa");
			await user.click(
				within(dialog).getByRole("button", { name: /add property/i }),
			);

			expect(
				screen.getByRole("heading", { name: /failed to add property/i }),
			).toBeInTheDocument();
		});

		it("calls onOpenChange(false) on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertPropertyDialog
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
		it("displays dialog with pre-filled property name and save button", () => {
			renderWithProviders(
				<UpsertPropertyDialog
					mode="edit"
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
			expect(
				within(dialog).getByRole("button", { name: /save/i }),
			).toBeInTheDocument();
		});

		it("disables save button for empty or whitespace input", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertPropertyDialog
					mode="edit"
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
			expect(saveButton).toBeDisabled();

			await user.type(input, "   ");
			expect(saveButton).toBeDisabled();

			await user.clear(input);
			await user.type(input, "Updated Property");
			expect(saveButton).toBeEnabled();
		});

		it("calls onSave with property id and trimmed name", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertPropertyDialog
					mode="edit"
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

		it("calls onOpenChange(false) on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertPropertyDialog
					mode="edit"
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

		it("shows error dialog on update failure", async () => {
			const user = userEvent.setup();
			mockOnSave.mockRejectedValue(new Error("API error"));

			renderWithProviders(
				<UpsertPropertyDialog
					mode="edit"
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
			await user.type(input, "Updated Villa");
			await user.click(within(dialog).getByRole("button", { name: /save/i }));

			expect(
				screen.getByRole("heading", { name: /failed to update property/i }),
			).toBeInTheDocument();
		});
	});
});
