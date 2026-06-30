import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import type { PaymentRecord, ServiceCharge } from "./types";
import { UpsertRentPaymentDialog } from "./upsert-rent-payment-dialog";

describe("UpsertRentPaymentDialog", () => {
	const mockPayment: PaymentRecord = {
		id: "1",
		roomId: "room-1",
		period: "2026-01",
		rentAmount: 1000,
		status: "pending",
	};
	const mockOnOpenChange = vi.fn();
	const mockOnSave = vi.fn().mockResolvedValue("payment-1");
	const mockOnSaveServiceCharges = vi.fn();
	const mockServiceCharges: ServiceCharge[] = [
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
		{
			serviceId: "svc-2",
			serviceName: "Water",
			pricingType: "flat",
			unitLabel: null,
			unitPrice: null,
			flatAmount: 50,
			usage: null,
			total: 50,
		},
	];

	beforeEach(() => {
		vi.setSystemTime(new Date("2026-01-25"));
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
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
					initialServiceCharges={[]}
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
			expect(periodTrigger).toHaveTextContent(`${month}-${year}`);

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
					initialServiceCharges={[]}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: /edit payment record/i }),
			).toBeInTheDocument();

			expect(
				within(dialog).getByRole("combobox", { name: /payment period/i }),
			).toHaveTextContent("01-2026");
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
					initialServiceCharges={[]}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const amountInput = within(dialog).getByLabelText(/rent/i);
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

		it("disables save button and shows helper text when month is already taken", async () => {
			const existingPayments: PaymentRecord[] = [
				{
					id: "p1",
					roomId: "room-1",
					period: "2026-01",
					rentAmount: 1000,
					status: "paid",
				},
			];

			renderWithProviders(
				<UpsertRentPaymentDialog
					mode="add"
					open={true}
					onOpenChange={mockOnOpenChange}
					onSave={mockOnSave}
					existingPayments={existingPayments}
					initialServiceCharges={[]}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const saveButton = within(dialog).getByRole("button", { name: /save/i });

			expect(saveButton).toBeDisabled();
			expect(
				screen.getByText(/already exists for this month/i),
			).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		describe("PaymentFlow", () => {
			it("saves payment with correct data in add mode", async () => {
				const user = userEvent.setup();
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						initialServiceCharges={[]}
					/>,
				);

				const dialog = screen.getByRole("dialog");
				const periodTrigger = within(dialog).getByRole("combobox", {
					name: /payment period/i,
				});
				const amountInput = within(dialog).getByLabelText(/rent/i);

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
						initialServiceCharges={[]}
					/>,
				);

				const dialog = screen.getByRole("dialog");
				const periodTrigger = within(dialog).getByRole("combobox", {
					name: /payment period/i,
				});
				const amountInput = within(dialog).getByLabelText(/rent/i);

				await user.click(periodTrigger);
				await user.click(screen.getByRole("button", { name: /mar/i }));

				await user.clear(amountInput);
				await user.type(amountInput, "1500");
				await user.click(within(dialog).getByRole("button", { name: /save/i }));

				expect(mockOnSave).toHaveBeenCalledWith(
					"1",
					"2026-03",
					1500,
					"pending",
				);
				expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			});

			it("shows loading state while saving", async () => {
				const onSave = vi.fn();
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={vi.fn()}
						onSave={onSave}
						initialServiceCharges={[]}
					/>,
				);

				const dialog = screen.getByRole("dialog");
				const amountInput = within(dialog).getByLabelText(/rent/i);
				const saveButton = within(dialog).getByRole("button", {
					name: /save/i,
				});

				await userEvent.setup().type(amountInput, "1200");
				fireEvent.click(saveButton);

				expect(onSave).toHaveBeenCalledWith(null, "2026-01", 1200, "pending");
				expect(
					screen.getByTestId("rent-payment-save-loader"),
				).toBeInTheDocument();
				expect(screen.queryByLabelText(/rent/i)).not.toBeInTheDocument();
			});

			it("shows error dialog on save failure and restores form", async () => {
				const onSave = vi.fn().mockRejectedValue(new Error("API error"));
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={vi.fn()}
						onSave={onSave}
						initialServiceCharges={[]}
					/>,
				);

				const dialog = screen.getByRole("dialog");
				const amountInput = within(dialog).getByLabelText(/rent/i);
				const saveButton = within(dialog).getByRole("button", {
					name: /save/i,
				});

				await userEvent.setup().type(amountInput, "1200");
				fireEvent.click(saveButton);

				expect(
					await screen.findByText(/problem adding this payment/i),
				).toBeInTheDocument();
				expect(screen.getByLabelText(/rent/i)).toBeInTheDocument();
			});

			it("closes dialog without saving on cancel", async () => {
				const user = userEvent.setup();
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						initialServiceCharges={[]}
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

		describe("ServiceCharges", () => {
			it("renders service charge inputs when initialServiceCharges provided", () => {
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						initialServiceCharges={mockServiceCharges}
					/>,
				);

				expect(screen.getByText("Electricity")).toBeInTheDocument();
				expect(screen.getByText("Water")).toBeInTheDocument();

				const dialog = screen.getByRole("dialog");
				const usageInput = within(dialog).getByDisplayValue("500");
				expect(usageInput).toBeInTheDocument();

				const flatInput = within(dialog).getByDisplayValue("50");
				expect(flatInput).toBeInTheDocument();
			});

			it("calls onSaveServiceCharges after successful save", async () => {
				const user = userEvent.setup();
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						initialServiceCharges={mockServiceCharges}
						onSaveServiceCharges={mockOnSaveServiceCharges}
					/>,
				);

				const dialog = screen.getByRole("dialog");
				const amountInput = within(dialog).getByLabelText(/rent/i);
				await user.type(amountInput, "1000");

				await user.click(within(dialog).getByRole("button", { name: /save/i }));

				const currentYear = new Date().getFullYear();
				expect(mockOnSaveServiceCharges).toHaveBeenCalledWith(
					`${currentYear}-01`,
					mockServiceCharges.map((c) => ({ ...c })),
					"payment-1",
				);
			});

			it("does not render service charges section when initialServiceCharges is empty", () => {
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						initialServiceCharges={[]}
					/>,
				);

				expect(screen.queryByText("Electricity")).not.toBeInTheDocument();
				expect(screen.queryByText("Water")).not.toBeInTheDocument();
			});

			it("shows combined rent and service charges total in summary", () => {
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						defaultAmount={1000}
						initialServiceCharges={mockServiceCharges}
					/>,
				);

				expect(screen.getByText("$1,000")).toBeInTheDocument();
				expect(screen.getByText("$125")).toBeInTheDocument();
				expect(screen.getByText("$1,125")).toBeInTheDocument();
			});

			it("updates total when flat charge is modified and calls onSaveServiceCharges with updated total", async () => {
				const user = userEvent.setup();
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						defaultAmount={1000}
						initialServiceCharges={mockServiceCharges}
						onSaveServiceCharges={mockOnSaveServiceCharges}
					/>,
				);

				const dialog = screen.getByRole("dialog");
				const flatInput = within(dialog).getByDisplayValue("50");
				await user.clear(flatInput);
				await user.type(flatInput, "75");

				await user.click(within(dialog).getByRole("button", { name: /save/i }));

				const savedCharges = mockOnSaveServiceCharges.mock
					.calls[0][1] as ServiceCharge[];
				const waterCharge = savedCharges.find((c) => c.serviceId === "svc-2");
				expect(waterCharge?.flatAmount).toBe(75);
				expect(waterCharge?.total).toBe(75);
			});

			it("updates total when variable charge usage is modified and calls onSaveServiceCharges with updated total", async () => {
				const user = userEvent.setup();
				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="add"
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={mockOnSave}
						defaultAmount={1000}
						initialServiceCharges={mockServiceCharges}
						onSaveServiceCharges={mockOnSaveServiceCharges}
					/>,
				);

				const dialog = screen.getByRole("dialog");
				const usageInput = within(dialog).getByDisplayValue("500");
				await user.clear(usageInput);
				await user.type(usageInput, "600");

				await user.click(within(dialog).getByRole("button", { name: /save/i }));

				const savedCharges = mockOnSaveServiceCharges.mock
					.calls[0][1] as ServiceCharge[];
				const electricityCharge = savedCharges.find(
					(c) => c.serviceId === "svc-1",
				);
				expect(electricityCharge?.usage).toBe(600);
				expect(electricityCharge?.total).toBe(90); // 600 * 0.15
			});

			it("renders and saves charges in edit mode", async () => {
				const user = userEvent.setup();
				const onSave = vi.fn().mockResolvedValue("payment-1");
				const onSaveServiceCharges = vi.fn();
				const payment = {
					id: "payment-1",
					roomId: "room-1",
					period: "2026-01",
					rentAmount: 1000,
					status: "pending" as const,
				};

				renderWithProviders(
					<UpsertRentPaymentDialog
						mode="edit"
						payment={payment}
						open={true}
						onOpenChange={mockOnOpenChange}
						onSave={onSave}
						initialServiceCharges={mockServiceCharges}
						onSaveServiceCharges={onSaveServiceCharges}
					/>,
				);

				expect(screen.getByText("Electricity")).toBeInTheDocument();
				expect(screen.getByText("Water")).toBeInTheDocument();

				const dialog = screen.getByRole("dialog");
				const amountInput = within(dialog).getByLabelText(/rent/i);
				expect(amountInput).toHaveValue(1000);

				await user.click(within(dialog).getByRole("button", { name: /save/i }));

				expect(onSaveServiceCharges).toHaveBeenCalledWith(
					"2026-01",
					mockServiceCharges.map((c) => ({ ...c })),
					"payment-1",
				);
			});
		});
	});
});
