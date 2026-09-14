import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { AmountInput } from "./amount-input";

function ControlledWrapper({
	initialValue = "",
	onChangeSpy,
}: {
	initialValue?: string;
	onChangeSpy?: (v: string) => void;
}) {
	const [value, setValue] = useState(initialValue);
	return (
		<>
			<label htmlFor="amount">Amount</label>
			<AmountInput
				id="amount"
				value={value}
				onChange={(v) => {
					setValue(v);
					onChangeSpy?.(v);
				}}
			/>
		</>
	);
}

describe("AmountInput", () => {
	describe("Display", () => {
		it("formats thousands with commas", () => {
			renderWithProviders(
				<AmountInput
					id="amount"
					aria-label="Amount"
					value="5000000"
					onChange={() => {}}
				/>,
			);
			expect(screen.getByLabelText(/amount/i)).toHaveValue("5,000,000");
		});

		it("keeps decimals with dot separator", () => {
			renderWithProviders(
				<AmountInput
					id="amount"
					aria-label="Amount"
					value="5000.5"
					onChange={() => {}}
				/>,
			);
			expect(screen.getByLabelText(/amount/i)).toHaveValue("5,000.5");
		});

		it("renders empty for empty value", () => {
			renderWithProviders(
				<AmountInput
					id="amount"
					aria-label="Amount"
					value=""
					onChange={() => {}}
				/>,
			);
			expect(screen.getByLabelText(/amount/i)).toHaveValue("");
		});
	});

	describe("Interactions", () => {
		it("formats user typing with commas", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ControlledWrapper />);
			const input = screen.getByLabelText(/amount/i);
			await user.type(input, "5000000");
			expect(input).toHaveValue("5,000,000");
		});

		it("strips commas and calls onChange with raw value", () => {
			const onChange = vi.fn();
			renderWithProviders(
				<AmountInput
					id="amount"
					aria-label="Amount"
					value=""
					onChange={onChange}
				/>,
			);
			const input = screen.getByLabelText(/amount/i);
			fireEvent.change(input, { target: { value: "5,000,000" } });
			expect(onChange).toHaveBeenCalledWith("5000000");
		});

		it("rejects negative sign", () => {
			const onChange = vi.fn();
			renderWithProviders(
				<AmountInput
					id="amount"
					aria-label="Amount"
					value=""
					onChange={onChange}
				/>,
			);
			const input = screen.getByLabelText(/amount/i);
			fireEvent.change(input, { target: { value: "-100" } });
			expect(onChange).toHaveBeenCalledWith("100");
		});

		it("limits decimals to two digits when typing", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ControlledWrapper />);
			const input = screen.getByLabelText(/amount/i);
			await user.type(input, "5000.129");
			expect(input).toHaveValue("5,000.12");
		});
	});
});
