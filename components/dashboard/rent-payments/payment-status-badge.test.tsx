import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PaymentStatusBadge } from "./payment-status-badge";

describe("PaymentStatusBadge", () => {
	it("displays pending status", () => {
		renderWithProviders(
			<PaymentStatusBadge status="pending" onClick={vi.fn()} />,
		);

		expect(screen.getByText("Pending")).toBeInTheDocument();
	});

	it("displays paid status", () => {
		renderWithProviders(<PaymentStatusBadge status="paid" onClick={vi.fn()} />);

		expect(screen.getByText("Paid")).toBeInTheDocument();
	});

	it("shows spinner when loading", () => {
		const { container } = renderWithProviders(
			<PaymentStatusBadge status="pending" onClick={vi.fn()} isLoading />,
		);

		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("does not show status text when loading", () => {
		renderWithProviders(
			<PaymentStatusBadge status="pending" onClick={vi.fn()} isLoading />,
		);

		expect(screen.queryByText("Pending")).not.toBeInTheDocument();
	});

	it("does not call onClick when loading", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();

		const { container } = renderWithProviders(
			<PaymentStatusBadge status="pending" onClick={handleClick} isLoading />,
		);

		const badge = container.firstChild as Element;
		await user.click(badge);
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("calls onClick when clicked", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();

		renderWithProviders(
			<PaymentStatusBadge status="pending" onClick={handleClick} />,
		);

		await user.click(screen.getByText("Pending"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});
