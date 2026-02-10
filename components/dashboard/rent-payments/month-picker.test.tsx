import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { MonthPicker } from "./month-picker";

function getViewYear(value: string): number {
	return new Date(`${value}-01`).getFullYear();
}

describe("MonthPicker", () => {
	const mockOnChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("displays formatted value", () => {
			renderWithProviders(
				<MonthPicker value="2026-01" onChange={mockOnChange} />,
			);

			const trigger = screen.getByRole("combobox");
			expect(trigger).toHaveTextContent("01-2026");
		});

		it("displays placeholder when empty", () => {
			renderWithProviders(<MonthPicker value="" onChange={mockOnChange} />);

			const trigger = screen.getByRole("combobox");
			expect(trigger).toHaveTextContent(/select month/i);
		});

		it("displays month grid when opened", async () => {
			const user = userEvent.setup();
			const testValue = "2026-01";
			const expectedYear = getViewYear(testValue);

			renderWithProviders(
				<MonthPicker value={testValue} onChange={mockOnChange} />,
			);

			const trigger = screen.getByRole("combobox");
			await user.click(trigger);

			// Check for year and month names
			expect(screen.getByText(String(expectedYear))).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /jan/i })).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /mar/i })).toBeInTheDocument();
		});

		it("displays helper text and error styles", () => {
			renderWithProviders(
				<MonthPicker
					value="2026-01"
					onChange={mockOnChange}
					helperText="Already taken"
				/>,
			);

			expect(screen.getByText("Already taken")).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("selects a month", async () => {
			const user = userEvent.setup();
			const testValue = "2026-01";
			const expectedYear = getViewYear(testValue);

			renderWithProviders(
				<MonthPicker value={testValue} onChange={mockOnChange} />,
			);

			const trigger = screen.getByRole("combobox");
			await user.click(trigger);

			const marchButton = screen.getByRole("button", { name: /mar/i });
			await user.click(marchButton);

			expect(mockOnChange).toHaveBeenCalledWith(`${expectedYear}-03`);
		});

		it("changes years", async () => {
			const user = userEvent.setup();
			const testValue = "2026-01";
			const expectedYear = getViewYear(testValue);

			renderWithProviders(
				<MonthPicker value={testValue} onChange={mockOnChange} />,
			);

			await user.click(screen.getByRole("combobox"));

			const nextYearButton = screen
				.getAllByRole("button")
				.find((btn) => btn.querySelector("svg.lucide-chevron-right"));
			if (!nextYearButton) throw new Error("Next year button not found");

			await user.click(nextYearButton);
			expect(screen.getByText(String(expectedYear + 1))).toBeInTheDocument();

			await user.click(screen.getByRole("button", { name: /mar/i }));
			expect(mockOnChange).toHaveBeenCalledWith(`${expectedYear + 1}-03`);
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

		it("disables months in the grid", async () => {
			const user = userEvent.setup();
			const testValue = "2026-01";
			const expectedYear = getViewYear(testValue);
			const disabledMonth = `${expectedYear}-03`;

			renderWithProviders(
				<MonthPicker
					value={testValue}
					onChange={mockOnChange}
					disabledMonths={[disabledMonth]}
				/>,
			);

			await user.click(screen.getByRole("combobox"));

			const marchButton = screen.getByRole("button", { name: /mar/i });
			expect(marchButton).toBeDisabled();

			await user.click(marchButton);
			expect(mockOnChange).not.toHaveBeenCalled();
		});
	});
});
