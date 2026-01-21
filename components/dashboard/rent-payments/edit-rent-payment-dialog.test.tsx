import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EditRentPaymentDialog } from "./edit-rent-payment-dialog";
import type { PaymentRecord } from "./types";

describe("EditRentPaymentDialog", () => {
	const mockPayment: PaymentRecord = {
		id: "payment-1",
		roomId: "room-1",
		period: "2026-01",
		amount: 1000,
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("does not display when closed", () => {
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={false}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("displays dialog with payment data when open", () => {
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
			expect(
				within(dialog).getByRole("heading", { name: /edit payment record/i }),
			).toBeInTheDocument();

			const periodInput = within(dialog).getByLabelText(/payment period/i);
			expect(periodInput).toHaveValue("2026-01");

			const amountInput = within(dialog).getByLabelText(/amount/i);
			expect(amountInput).toHaveValue(1000);
		});

		it("updates inputs when payment changes", () => {
			const { rerender } = renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const periodInput = within(dialog).getByLabelText(/payment period/i);
			const amountInput = within(dialog).getByLabelText(/amount/i);

			expect(periodInput).toHaveValue("2026-01");
			expect(amountInput).toHaveValue(1000);

			// Rerender with different payment
			const newPayment: PaymentRecord = {
				id: "payment-2",
				roomId: "room-1",
				period: "2026-02",
				amount: 1500,
			};
			rerender(
				<EditRentPaymentDialog
					payment={newPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			expect(periodInput).toHaveValue("2026-02");
			expect(amountInput).toHaveValue(1500);
		});

		it("displays currency indicator", () => {
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(within(dialog).getByText(/USD/i)).toBeInTheDocument();
		});
	});

	describe("Form Validation", () => {
		it("disables save button when period is empty", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const periodInput = within(dialog).getByLabelText(/payment period/i);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(periodInput);

			expect(saveButton).toBeDisabled();
		});

		it("disables save button when amount is empty", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const amountInput = within(dialog).getByLabelText(/amount/i);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(amountInput);

			expect(saveButton).toBeDisabled();
		});

		it("disables save button when amount is zero", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const amountInput = within(dialog).getByLabelText(/amount/i);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(amountInput);
			await user.type(amountInput, "0");

			expect(saveButton).toBeDisabled();
		});

		it("disables save button when amount is negative", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const amountInput = within(dialog).getByLabelText(/amount/i);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(amountInput);
			await user.type(amountInput, "-100");

			expect(saveButton).toBeDisabled();
		});

		it("enables save button when all inputs are valid", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const periodInput = within(dialog).getByLabelText(/payment period/i);
			const amountInput = within(dialog).getByLabelText(/amount/i);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(periodInput);
			await user.type(periodInput, "2026-03");
			await user.clear(amountInput);
			await user.type(amountInput, "1200");

			expect(saveButton).not.toBeDisabled();
		});
	});

	describe("Actions", () => {
		it("calls onSave with updated data when save button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const periodInput = within(dialog).getByLabelText(/payment period/i);
			const amountInput = within(dialog).getByLabelText(/amount/i);
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			await user.clear(periodInput);
			await user.type(periodInput, "2026-03");
			await user.clear(amountInput);
			await user.type(amountInput, "1500");
			await user.click(saveButton);

			expect(mockOnSave).toHaveBeenCalledWith("payment-1", "2026-03", 1500);
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("closes dialog without calling onSave when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<EditRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const cancelButton = within(dialog).getByRole("button", {
				name: /cancel/i,
			});

			await user.click(cancelButton);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			expect(mockOnSave).not.toHaveBeenCalled();
		});
	});
});
