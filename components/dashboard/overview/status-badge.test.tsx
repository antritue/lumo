import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { NotRecordedBadge, StatusBadge } from "./status-badge";
import { useOverviewStore } from "./store";

const mockPayment = (overrides = {}) => ({
	id: "pay-1",
	roomId: "room-1",
	period: "2026-08",
	rentAmount: 800,
	status: "pending" as const,
	...overrides,
});

describe("StatusBadge", () => {
	it("renders a paid button", () => {
		renderWithProviders(
			<StatusBadge payment={mockPayment({ status: "paid" })} />,
		);

		expect(screen.getByRole("button", { name: /paid/i })).toBeInTheDocument();
	});

	it("renders a pending button", () => {
		renderWithProviders(<StatusBadge payment={mockPayment()} />);

		expect(
			screen.getByRole("button", { name: /pending/i }),
		).toBeInTheDocument();
	});

	it("shows a spinner and disables the button while loading", () => {
		useOverviewStore.setState({ togglingPaymentId: "pay-1" });
		renderWithProviders(
			<StatusBadge payment={mockPayment({ status: "paid" })} />,
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button.querySelector(".animate-spin")).toBeInTheDocument();

		useOverviewStore.setState({ togglingPaymentId: null });
	});
});

describe("NotRecordedBadge", () => {
	it("renders a non-clickable badge", () => {
		renderWithProviders(<NotRecordedBadge />);

		expect(screen.getByText(/not recorded/i)).toBeInTheDocument();
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
