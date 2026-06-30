import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PaymentRecord } from "@/components/dashboard/rent-payments/types";
import { renderWithProviders } from "@/test/render";
import { RoomPaymentsSection } from "./room-payments-section";

describe("RoomPaymentsSection", () => {
	const mockPayments: PaymentRecord[] = [
		{
			id: "1",
			roomId: "room-1",
			period: "2026-01",
			rentAmount: 1500000,
			status: "pending",
		},
		{
			id: "2",
			roomId: "room-1",
			period: "2025-12",
			rentAmount: 1500000,
			status: "paid",
		},
	];

	describe("Display", () => {
		it("displays section title and add button", () => {
			const onAdd = vi.fn();
			const onEdit = vi.fn();
			const onDelete = vi.fn();

			renderWithProviders(
				<RoomPaymentsSection
					payments={mockPayments}
					onAdd={onAdd}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			expect(
				screen.getByRole("heading", { name: /payment records/i }),
			).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
		});

		it("displays payment records list", () => {
			const onAdd = vi.fn();
			const onEdit = vi.fn();
			const onDelete = vi.fn();

			renderWithProviders(
				<RoomPaymentsSection
					payments={mockPayments}
					onAdd={onAdd}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			expect(screen.getByText("01-2026")).toBeInTheDocument();
			expect(screen.getByText("12-2025")).toBeInTheDocument();
		});
	});

	it("displays error state when 	isPaymentsFetchFailed is true", () => {
		const onAdd = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		renderWithProviders(
			<RoomPaymentsSection
				payments={[]}
				onAdd={onAdd}
				onEdit={onEdit}
				onDelete={onDelete}
				isPaymentsFetchFailed
			/>,
		);

		expect(
			screen.getByRole("heading", { name: /failed to load data/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /add/i }),
		).not.toBeInTheDocument();
	});

	it("calls onRetryPayments when retry button clicked", async () => {
		const user = userEvent.setup();
		const onRetry = vi.fn();
		const onAdd = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		renderWithProviders(
			<RoomPaymentsSection
				payments={[]}
				onAdd={onAdd}
				onEdit={onEdit}
				onDelete={onDelete}
				isPaymentsFetchFailed
				onRetryPayments={onRetry}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	describe("Interactions", () => {
		it("calls onAdd when add button clicked", async () => {
			const user = userEvent.setup();
			const onAdd = vi.fn();
			const onEdit = vi.fn();
			const onDelete = vi.fn();

			renderWithProviders(
				<RoomPaymentsSection
					payments={mockPayments}
					onAdd={onAdd}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /add/i }));
			expect(onAdd).toHaveBeenCalled();
		});
	});
});
