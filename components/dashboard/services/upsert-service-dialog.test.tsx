import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import type { Service } from "./types";
import { UpsertServiceDialog } from "./upsert-service-dialog";

describe("UpsertServiceDialog", () => {
	const mockService: Service = {
		id: "svc-1",
		userId: "user-1",
		name: "WiFi",
		unitLabel: null,
		pricingType: "flat",
		flatAmount: 15,
		unitPrice: null,
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("displays add mode with empty fields", () => {
			renderWithProviders(
				<UpsertServiceDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /add service/i }),
			).toBeInTheDocument();
			expect(within(dialog).getByPlaceholderText(/service name/i)).toHaveValue(
				"",
			);
			expect(within(dialog).getByPlaceholderText(/unit/i)).toHaveValue("");
		});

		it("displays edit mode with service data", () => {
			renderWithProviders(
				<UpsertServiceDialog
					mode="edit"
					service={mockService}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /edit service/i }),
			).toBeInTheDocument();
			expect(within(dialog).getByPlaceholderText(/service name/i)).toHaveValue(
				"WiFi",
			);
		});
	});

	describe("Interactions", () => {
		it("disables save button when name is empty", () => {
			renderWithProviders(
				<UpsertServiceDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			expect(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /add service/i,
				}),
			).toBeDisabled();
		});

		it("enables save button when name is entered", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertServiceDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(/service name/i);
			const saveButton = within(dialog).getByRole("button", {
				name: /add service/i,
			});

			expect(saveButton).toBeDisabled();

			await user.type(input, "Electricity");
			expect(saveButton).toBeEnabled();
		});

		it("saves service with correct data in add mode", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertServiceDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const nameInput = within(dialog).getByPlaceholderText(/service name/i);
			const saveButton = within(dialog).getByRole("button", {
				name: /add service/i,
			});

			await user.type(nameInput, "Cleaning");
			await user.click(saveButton);

			expect(mockOnSave).toHaveBeenCalledWith(
				null,
				"Cleaning",
				null,
				"flat",
				null,
				null,
			);
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("saves service with variable pricing in add mode", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertServiceDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const nameInput = within(dialog).getByPlaceholderText(/service name/i);
			const variableButton = within(dialog).getByRole("button", {
				name: /usage/i,
			});

			await user.type(nameInput, "Electricity");
			await user.click(variableButton);

			const amountInput =
				within(dialog).getByPlaceholderText(/price per unit/i);
			await user.type(amountInput, "0.15");

			const form = within(dialog)
				.getByRole("button", { name: /add service/i })
				.closest("form");
			expect(form).not.toBeNull();
			fireEvent.submit(form as HTMLFormElement);

			expect(mockOnSave).toHaveBeenCalledWith(
				null,
				"Electricity",
				null,
				"variable",
				null,
				0.15,
			);
		});

		it("saves service with correct data in edit mode", async () => {
			renderWithProviders(
				<UpsertServiceDialog
					mode="edit"
					service={mockService}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const form = within(dialog)
				.getByRole("button", { name: /save/i })
				.closest("form");
			expect(form).not.toBeNull();
			fireEvent.submit(form as HTMLFormElement);

			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(mockOnSave).toHaveBeenCalledWith(
				"svc-1",
				"WiFi",
				null,
				"flat",
				15,
				null,
			);
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("shows loading state while saving", async () => {
			const onSave = vi.fn();
			renderWithProviders(
				<UpsertServiceDialog
					mode="add"
					open={true}
					onOpenChange={vi.fn()}
					onSave={onSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const nameInput = within(dialog).getByPlaceholderText(/service name/i);
			const saveButton = within(dialog).getByRole("button", {
				name: /add service/i,
			});

			await userEvent.setup().type(nameInput, "Test");
			fireEvent.click(saveButton);

			expect(screen.getByTestId("service-save-loader")).toBeInTheDocument();
			expect(
				screen.queryByPlaceholderText(/service name/i),
			).not.toBeInTheDocument();
		});

		it("shows error dialog on save failure and restores form", async () => {
			const onSave = vi.fn().mockRejectedValue(new Error("API error"));
			renderWithProviders(
				<UpsertServiceDialog
					mode="add"
					open={true}
					onOpenChange={vi.fn()}
					onSave={onSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const nameInput = within(dialog).getByPlaceholderText(/service name/i);
			const saveButton = within(dialog).getByRole("button", {
				name: /add service/i,
			});

			await userEvent.setup().type(nameInput, "Test");
			fireEvent.click(saveButton);

			expect(
				await screen.findByText(/problem adding this service/i),
			).toBeInTheDocument();
			expect(screen.getByPlaceholderText(/service name/i)).toBeInTheDocument();
		});

		it("shows update error message in edit mode", async () => {
			const onSave = vi.fn().mockRejectedValue(new Error("API error"));
			renderWithProviders(
				<UpsertServiceDialog
					mode="edit"
					service={mockService}
					open={true}
					onOpenChange={vi.fn()}
					onSave={onSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const form = within(dialog)
				.getByRole("button", { name: /save/i })
				.closest("form");
			expect(form).not.toBeNull();
			fireEvent.submit(form as HTMLFormElement);

			expect(
				await screen.findByText(/problem updating this service/i),
			).toBeInTheDocument();
			expect(screen.getByPlaceholderText(/service name/i)).toBeInTheDocument();
		});

		it("closes dialog without saving on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertServiceDialog
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
});
