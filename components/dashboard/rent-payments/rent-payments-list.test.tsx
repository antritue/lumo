import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RentPaymentsList } from "./rent-payments-list";
import type { PaymentRecord } from "./types";

describe("RentPaymentsList", () => {
	const mockPayments: PaymentRecord[] = [
		{
			id: "1",
			period: "2026-01",
			amount: 5000000,
			roomId: "room-1",
			status: "pending",
		},
		{
			id: "2",
			period: "2025-12",
			amount: 4500000,
			roomId: "room-1",
			status: "paid",
		},
	];

	describe("Display", () => {
		it("displays empty state", () => {
			renderWithProviders(<RentPaymentsList payments={[]} />);

			expect(screen.getByText(/no payment records yet/i)).toBeInTheDocument();
			expect(
				screen.getByText(/add your first rent payment to start tracking/i),
			).toBeInTheDocument();
		});

		it("displays payment records with formatted period, amount and status", () => {
			renderWithProviders(<RentPaymentsList payments={mockPayments} />);

			expect(screen.getByText("01/2026")).toBeInTheDocument();
			expect(screen.getByText("$5,000,000")).toBeInTheDocument();
			expect(screen.getByText("Pending")).toBeInTheDocument();
			expect(screen.getByText("12/2025")).toBeInTheDocument();
			expect(screen.getByText("$4,500,000")).toBeInTheDocument();
			expect(screen.getByText("Paid")).toBeInTheDocument();
		});

		it("shows no action buttons when no handlers provided", () => {
			renderWithProviders(<RentPaymentsList payments={mockPayments} />);

			expect(
				screen.queryByRole("button", { name: /edit/i }),
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: /delete/i }),
			).not.toBeInTheDocument();
		});

		it("shows only provided handler buttons", () => {
			renderWithProviders(
				<RentPaymentsList payments={mockPayments} onEdit={vi.fn()} />,
			);

			expect(screen.getAllByRole("button", { name: /edit/i })).toHaveLength(2);
			expect(
				screen.queryByRole("button", { name: /delete/i }),
			).not.toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls onEdit with payment when edit button clicked", async () => {
			const user = userEvent.setup();
			const handleEdit = vi.fn();

			renderWithProviders(
				<RentPaymentsList payments={mockPayments} onEdit={handleEdit} />,
			);

			await user.click(screen.getAllByRole("button", { name: /edit/i })[0]);
			expect(handleEdit).toHaveBeenCalledWith(mockPayments[0]);
		});

		it("calls onDelete with payment when delete button clicked", async () => {
			const user = userEvent.setup();
			const handleDelete = vi.fn();

			renderWithProviders(
				<RentPaymentsList payments={mockPayments} onDelete={handleDelete} />,
			);

			await user.click(screen.getAllByRole("button", { name: /delete/i })[0]);
			expect(handleDelete).toHaveBeenCalledWith(mockPayments[0]);
		});
	});
});
