import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { CreatePropertyForm } from "./create-property-form";

describe("CreatePropertyForm", () => {
	describe("Display", () => {
		it("displays form input and conditional cancel button", () => {
			const onSubmit = vi.fn();
			const { rerender } = renderWithProviders(
				<CreatePropertyForm onSubmit={onSubmit} />,
			);

			expect(
				screen.getByPlaceholderText(/property name or address/i),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add property/i }),
			).toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: /cancel/i }),
			).not.toBeInTheDocument();

			rerender(
				<CreatePropertyForm
					onSubmit={onSubmit}
					onCancel={vi.fn()}
					showCancel={true}
				/>,
			);
			expect(
				screen.getByRole("button", { name: /cancel/i }),
			).toBeInTheDocument();
		});
	});

	describe("Form Validation", () => {
		it("disables submit button for invalid input", async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

			const input = screen.getByPlaceholderText(/property name or address/i);
			const submitButton = screen.getByRole("button", {
				name: /add property/i,
			});

			// Empty input
			expect(submitButton).toBeDisabled();

			// Whitespace only
			await user.type(input, "   ");
			expect(submitButton).toBeDisabled();

			// Valid input
			await user.clear(input);
			await user.type(input, "New Property");
			expect(submitButton).toBeEnabled();
		});
	});

	describe("Interactions", () => {
		it("submits with trimmed value and clears input", async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

			const input = screen.getByPlaceholderText(/property name or address/i);
			const submitButton = screen.getByRole("button", {
				name: /add property/i,
			});

			await user.type(input, "  Sunset Villa  ");
			await user.click(submitButton);

			expect(onSubmit).toHaveBeenCalledWith("Sunset Villa");
			expect(input).toHaveValue("");
		});

		it("calls onCancel when cancel button clicked", async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			const onCancel = vi.fn();
			renderWithProviders(
				<CreatePropertyForm
					onSubmit={onSubmit}
					onCancel={onCancel}
					showCancel={true}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /cancel/i }));
			expect(onCancel).toHaveBeenCalled();
			expect(onSubmit).not.toHaveBeenCalled();
		});
	});
});
