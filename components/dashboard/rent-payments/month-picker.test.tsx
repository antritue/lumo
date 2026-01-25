import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { MonthPicker } from "./month-picker";

describe("MonthPicker", () => {
	const mockOnChange = vi.fn();

	describe("Display", () => {
		it("displays formatted value", () => {
			renderWithProviders(
				<MonthPicker value="2026-01" onChange={mockOnChange} />,
			);

			const trigger = screen.getByRole("combobox");
			expect(trigger).toHaveTextContent("01/2026");
		});

		it("displays placeholder when empty", () => {
			renderWithProviders(<MonthPicker value="" onChange={mockOnChange} />);

			const trigger = screen.getByRole("combobox");
			expect(trigger).toHaveTextContent(/select month/i);
		});

		it("displays month grid when opened", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<MonthPicker value="2026-01" onChange={mockOnChange} />,
			);

			const trigger = screen.getByRole("combobox");
			await user.click(trigger);

			// Check for year and month names
			expect(screen.getByText("2026")).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /jan/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /mar/i })).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("selects a month", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<MonthPicker value="2026-01" onChange={mockOnChange} />,
			);

			const trigger = screen.getByRole("combobox");
			await user.click(trigger);

			const marchButton = screen.getByRole("button", { name: /mar/i });
			await user.click(marchButton);

			expect(mockOnChange).toHaveBeenCalledWith("2026-03");
		});

		it("changes years", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<MonthPicker value="2026-01" onChange={mockOnChange} />,
			);

			await user.click(screen.getByRole("combobox"));

			const nextYearButton = screen
				.getAllByRole("button")
				.find((btn) => btn.querySelector("svg.lucide-chevron-right"));
			if (!nextYearButton) throw new Error("Next year button not found");

			await user.click(nextYearButton);
			expect(screen.getByText("2027")).toBeInTheDocument();

			await user.click(screen.getByRole("button", { name: /mar/i }));
			expect(mockOnChange).toHaveBeenCalledWith("2027-03");
		});

		it("selects current month shortcut", async () => {
			const user = userEvent.setup();
			renderWithProviders(<MonthPicker value="" onChange={mockOnChange} />);

			await user.click(screen.getByRole("combobox"));

			const thisMonthButton = screen.getByRole("button", {
				name: /this month/i,
			});
			await user.click(thisMonthButton);

			const today = new Date();
			const expectedValues = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}`;
			expect(mockOnChange).toHaveBeenCalledWith(expectedValues);
		});

		it("clears selection shortcut", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<MonthPicker value="2026-01" onChange={mockOnChange} />,
			);

			await user.click(screen.getByRole("combobox"));

			const clearButton = screen.getByRole("button", { name: /clear/i });
			await user.click(clearButton);

			expect(mockOnChange).toHaveBeenCalledWith("");
		});
	});
});
