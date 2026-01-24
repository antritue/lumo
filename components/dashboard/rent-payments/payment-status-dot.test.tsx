import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PaymentStatusDot } from "./payment-status-dot";

describe("PaymentStatusDot", () => {
	it("renders green dot with accessible label for paid", () => {
		renderWithProviders(<PaymentStatusDot status="paid" />);

		const dot = screen.getByText(/latest payment status:\s*paid/i);
		expect(dot).toBeInTheDocument();
	});

	it("renders amber dot with accessible label for pending", () => {
		renderWithProviders(<PaymentStatusDot status="pending" />);

		const dot = screen.getByText(/latest payment status:\s*pending/i);
		expect(dot).toBeInTheDocument();
	});

	it("renders nothing when status is null or undefined", () => {
		renderWithProviders(<PaymentStatusDot status={null} />);

		expect(
			screen.queryByText(/latest payment status:/i),
		).not.toBeInTheDocument();
	});
});
