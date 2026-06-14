import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { ServiceItem } from "./service-item";
import type { Service } from "./types";

describe("ServiceItem", () => {
	const mockService: Service = {
		id: "1",
		userId: "user-1",
		name: "Electricity",
		unitLabel: "kWh",
		pricingType: "variable",
		flatAmount: null,
		unitPrice: 0.15,
	};
	const mockOnEdit = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("displays expanded details when clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceItem service={mockService} />);

			await user.click(screen.getByRole("button", { expanded: false }));

			expect(screen.getAllByText(/kWh/i).length).toBeGreaterThan(0);
			expect(screen.getByText(/usage/i)).toBeInTheDocument();
			expect(screen.getByText(/\$0.15/i)).toBeInTheDocument();
		});

		it("shows flat fee details for flat pricing", async () => {
			const user = userEvent.setup();
			const flatService: Service = {
				id: "2",
				userId: "user-1",
				name: "WiFi",
				unitLabel: null,
				pricingType: "flat",
				flatAmount: 20,
				unitPrice: null,
			};

			renderWithProviders(<ServiceItem service={flatService} />);

			await user.click(screen.getByRole("button", { expanded: false }));

			expect(screen.getByText(/flat fee/i)).toBeInTheDocument();
			expect(screen.getByText(/\$20/i)).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("toggles expand/collapse state", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceItem service={mockService} />);

			const toggleButton = screen.getByRole("button", { expanded: false });
			await user.click(toggleButton);
			expect(
				screen.getByRole("button", { expanded: true }),
			).toBeInTheDocument();

			await user.click(screen.getByRole("button", { expanded: true }));
			expect(
				screen.getByRole("button", { expanded: false }),
			).toBeInTheDocument();
		});

		it("calls callbacks when action buttons clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<ServiceItem
					service={mockService}
					onEdit={mockOnEdit}
					onDelete={mockOnDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /edit/i }));
			expect(mockOnEdit).toHaveBeenCalledWith(mockService);

			await user.click(screen.getByRole("button", { name: /delete/i }));
			expect(mockOnDelete).toHaveBeenCalledWith(mockService);
		});
	});
});
