import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RentPaymentsList } from "./rent-payments-list";
import type { PaymentRecord, ServiceCharge } from "./types";

describe("RentPaymentsList", () => {
	const mockCharges: Record<string, ServiceCharge[]> = {
		"2026-01": [
			{
				serviceId: "svc-1",
				serviceName: "Electricity",
				pricingType: "variable",
				unitLabel: "kWh",
				unitPrice: 0.15,
				flatAmount: null,
				usage: 500,
				total: 75,
			},
		],
	};

	const mockPayments: PaymentRecord[] = [
		{
			id: "1",
			period: "2026-01",
			rentAmount: 5000000,
			roomId: "room-1",
			status: "pending",
		},
		{
			id: "2",
			period: "2025-12",
			rentAmount: 4500000,
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

			expect(screen.getByText("01-2026")).toBeInTheDocument();
			expect(screen.getByText("$5,000,000")).toBeInTheDocument();
			expect(screen.getByText("Pending")).toBeInTheDocument();
			expect(screen.getByText("12-2025")).toBeInTheDocument();
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

		it("shows kebab menu with actions when handlers provided", () => {
			renderWithProviders(
				<RentPaymentsList payments={mockPayments} onEdit={vi.fn()} />,
			);

			const kebabButtons = screen.getAllByRole("button");
			expect(kebabButtons.length).toBeGreaterThan(0);
		});

		it("shows collapsed payment with combined total when charges exist", () => {
			renderWithProviders(
				<RentPaymentsList
					payments={mockPayments}
					serviceChargesByPeriod={mockCharges}
				/>,
			);

			expect(screen.getByText("$5,000,075")).toBeInTheDocument();
			expect(screen.getByText("inc. services")).toBeInTheDocument();
		});

		it("shows rent amount without inc. services when no charges", () => {
			renderWithProviders(<RentPaymentsList payments={mockPayments} />);

			expect(screen.getByText("$5,000,000")).toBeInTheDocument();
			expect(screen.queryByText("inc. services")).not.toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls onEdit with payment when edit button clicked", async () => {
			const user = userEvent.setup();
			const handleEdit = vi.fn();

			renderWithProviders(
				<RentPaymentsList payments={mockPayments} onEdit={handleEdit} />,
			);

			const kebabTriggers = screen.getAllByRole("button", { name: "" });
			await user.click(kebabTriggers[0]);
			await user.click(screen.getByRole("button", { name: /edit/i }));
			expect(handleEdit).toHaveBeenCalledWith(mockPayments[0]);
		});

		it("expands to show charge breakdown when clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<RentPaymentsList
					payments={mockPayments}
					serviceChargesByPeriod={mockCharges}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /01-2026/i }));

			expect(screen.getByText("Electricity")).toBeInTheDocument();
			expect(screen.getByText("$75")).toBeInTheDocument();
			expect(screen.getByText(/500 kWh.*\$0/)).toBeInTheDocument();
		});

		it("collapses expanded payment when clicked again", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<RentPaymentsList
					payments={mockPayments}
					serviceChargesByPeriod={mockCharges}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /01-2026/i }));
			expect(screen.getByText("Electricity")).toBeInTheDocument();

			await user.click(screen.getByRole("button", { name: /01-2026/i }));
			expect(screen.queryByText("Electricity")).not.toBeInTheDocument();
		});

		it("calls onDelete with payment when delete button clicked", async () => {
			const user = userEvent.setup();
			const handleDelete = vi.fn();

			renderWithProviders(
				<RentPaymentsList payments={mockPayments} onDelete={handleDelete} />,
			);

			const kebabTriggers = screen.getAllByRole("button", { name: "" });
			await user.click(kebabTriggers[0]);
			await user.click(screen.getByRole("button", { name: /delete/i }));
			expect(handleDelete).toHaveBeenCalledWith(mockPayments[0]);
		});
	});
});
