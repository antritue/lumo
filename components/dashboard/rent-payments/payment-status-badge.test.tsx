import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import {
	getPaymentStatusBadgeClasses,
	PaymentStatusBadge,
} from "./payment-status-badge";

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

describe("getPaymentStatusBadgeClasses", () => {
	it("includes interactive styles by default", () => {
		const classes = getPaymentStatusBadgeClasses("paid");

		expect(classes).toContain("text-green-500");
		expect(classes).toContain("cursor-pointer");
		expect(classes).toContain("hover:bg-green-500/10");
	});

	it("omits interactive styles for presentational chips", () => {
		const classes = getPaymentStatusBadgeClasses("pending", {
			interactive: false,
		});

		expect(classes).toContain("border-amber-500/40");
		expect(classes).toContain("text-amber-500");
		expect(classes).not.toContain("cursor-pointer");
		expect(classes).not.toContain("hover:bg-amber-500/10");
	});
});
