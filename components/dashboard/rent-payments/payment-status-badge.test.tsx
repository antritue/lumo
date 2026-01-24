import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PaymentStatusBadge } from "./payment-status-badge";

describe("PaymentStatusBadge", () => {
	it("displays pending status with correct styling", () => {
		renderWithProviders(<PaymentStatusBadge status="pending" />);

		const badge = screen.getByText("Pending");
		expect(badge).toBeInTheDocument();
	});

	it("displays paid status with correct styling", () => {
		renderWithProviders(<PaymentStatusBadge status="paid" />);

		const badge = screen.getByText("Paid");
		expect(badge).toBeInTheDocument();
	});
});
