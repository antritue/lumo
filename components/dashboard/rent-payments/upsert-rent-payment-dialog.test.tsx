import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import type { PaymentRecord } from "./types";
import { UpsertRentPaymentDialog } from "./upsert-rent-payment-dialog";

describe("UpsertRentPaymentDialog", () => {
	const mockPayment: PaymentRecord = {
		id: "1",
		roomId: "room-1",
		period: "2026-01",
		amount: 1000,
		status: "pending",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("displays add mode with current month and optional default amount", () => {
			renderWithProviders(
				<UpsertRentPaymentDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
					defaultAmount={1500}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /add payment/i }),
			).toBeInTheDocument();

			const periodTrigger = within(dialog).getByRole("combobox", {
				name: /payment period/i,
			});
			const today = new Date();
			const month = (today.getMonth() + 1).toString().padStart(2, "0");
			const year = today.getFullYear();
			expect(periodTrigger).toHaveTextContent(`${month}/${year}`);

			const amountInput = within(dialog).getByLabelText(/amount/i);
			expect(amountInput).toHaveValue(1500);

			const pendingRadio = within(dialog).getByLabelText(/pending/i);
			expect(pendingRadio).toBeChecked();
		});

		it("displays edit mode with payment data", () => {
			renderWithProviders(
				<UpsertRentPaymentDialog
					mode="edit"
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /edit payment record/i }),
			).toBeInTheDocument();

			expect(
				within(dialog).getByRole("combobox", { name: /payment period/i }),
			).toHaveTextContent("01/2026");
			expect(within(dialog).getByLabelText(/amount/i)).toHaveValue(1000);

			const pendingRadio = within(dialog).getByLabelText(/pending/i);
			expect(pendingRadio).toBeChecked();
		});
	});

	describe("Validation", () => {
		it("disables save button for invalid amounts", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRentPaymentDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const amountInput = within(dialog).getByLabelText(/amount/i);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			// Empty amount
			expect(saveButton).toBeDisabled();

			// Zero amount
			await user.type(amountInput, "0");
			expect(saveButton).toBeDisabled();

			// Negative amount
			await user.clear(amountInput);
			await user.type(amountInput, "-100");
			expect(saveButton).toBeDisabled();

			// Valid amount
			await user.clear(amountInput);
			await user.type(amountInput, "1200");
			expect(saveButton).not.toBeDisabled();
		});
	});

	describe("Interactions", () => {
		it("saves payment with correct data in add mode", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRentPaymentDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const periodTrigger = within(dialog).getByRole("combobox", {
				name: /payment period/i,
			});
			const amountInput = within(dialog).getByLabelText(/amount/i);

			await user.click(periodTrigger);
			await user.click(screen.getByRole("button", { name: /mar/i }));

			await user.type(amountInput, "1500");
			await user.click(within(dialog).getByRole("button", { name: /save/i }));

			const currentYear = new Date().getFullYear();
			expect(mockOnSave).toHaveBeenCalledWith(
				null,
				`${currentYear}-03`,
				1500,
				"pending",
			);
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("saves payment with correct data in edit mode", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRentPaymentDialog
					mode="edit"
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const periodTrigger = within(dialog).getByRole("combobox", {
				name: /payment period/i,
			});
			const amountInput = within(dialog).getByLabelText(/amount/i);

			await user.click(periodTrigger);
			await user.click(screen.getByRole("button", { name: /mar/i }));

			await user.clear(amountInput);
			await user.type(amountInput, "1500");
			await user.click(within(dialog).getByRole("button", { name: /save/i }));

			expect(mockOnSave).toHaveBeenCalledWith("1", "2026-03", 1500, "pending");
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("closes dialog without saving on cancel", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<UpsertRentPaymentDialog
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
