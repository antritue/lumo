import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeleteRentPaymentDialog } from "./delete-rent-payment-dialog";
import type { PaymentRecord } from "./types";

describe("DeleteRentPaymentDialog", () => {
	const mockPayment: PaymentRecord = {
		id: "payment-1",
		roomId: "room-1",
		period: "2026-01",
		amount: 1000,
	};
	const mockOnOpenChange = vi.fn();
	const mockOnConfirm = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("does not display when closed", () => {
			renderWithProviders(
				<DeleteRentPaymentDialog
					payment={mockPayment}
					open={false}
					onOpenChange={mockOnOpenChange}
					onConfirm={mockOnConfirm}
				/>,
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("displays dialog with all elements when open", () => {
			renderWithProviders(
				<DeleteRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onConfirm={mockOnConfirm}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const heading = within(dialog).getByRole("heading", {
				name: /delete payment record/i,
			});

			expect(heading).toBeInTheDocument();
			expect(heading.querySelector("svg")).toBeInTheDocument();
			expect(
				within(dialog).getByText(/permanently delete this payment record/i),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("button", { name: /delete record/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("button", { name: /cancel/i }),
			).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls onConfirm with payment id when delete button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeleteRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onConfirm={mockOnConfirm}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const deleteButton = within(dialog).getByRole("button", {
				name: /delete record/i,
			});

			await user.click(deleteButton);

			expect(mockOnConfirm).toHaveBeenCalledWith("payment-1");
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});

		it("closes dialog without calling onConfirm when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeleteRentPaymentDialog
					payment={mockPayment}
					open={true}
					onOpenChange={mockOnOpenChange}
					onConfirm={mockOnConfirm}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const cancelButton = within(dialog).getByRole("button", {
				name: /cancel/i,
			});

			await user.click(cancelButton);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			expect(mockOnConfirm).not.toHaveBeenCalled();
		});
	});
});
