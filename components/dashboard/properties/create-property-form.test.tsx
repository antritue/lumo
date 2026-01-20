import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { CreatePropertyForm } from "./create-property-form";

describe("CreatePropertyForm", () => {
	it("displays form input and submit button", () => {
		const onSubmit = vi.fn();
		renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

		expect(
			screen.getByPlaceholderText(/property name or address/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add property/i }),
		).toBeInTheDocument();
	});

	it("disables submit button when input is empty", () => {
		const onSubmit = vi.fn();
		renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

		const submitButton = screen.getByRole("button", { name: /add property/i });
		expect(submitButton).toBeDisabled();
	});

	it("enables submit button when user enters text", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

		const input = screen.getByPlaceholderText(/property name or address/i);
		await user.type(input, "New Property");

		const submitButton = screen.getByRole("button", { name: /add property/i });
		expect(submitButton).toBeEnabled();
	});

	it("calls onSubmit with trimmed property name", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

		const input = screen.getByPlaceholderText(/property name or address/i);
		const submitButton = screen.getByRole("button", { name: /add property/i });

		await user.type(input, "  Sunset Villa  ");
		await user.click(submitButton);

		expect(onSubmit).toHaveBeenCalledWith("Sunset Villa");
	});

	it("clears input after successful submission", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

		const input = screen.getByPlaceholderText(/property name or address/i);
		const submitButton = screen.getByRole("button", { name: /add property/i });

		await user.type(input, "Test Property");
		await user.click(submitButton);

		expect(input).toHaveValue("");
	});

	it("does not submit when input is only whitespace", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

		const input = screen.getByPlaceholderText(/property name or address/i);
		const submitButton = screen.getByRole("button", { name: /add property/i });

		await user.type(input, "   ");
		await user.click(submitButton);

		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("shows cancel button when showCancel is true", () => {
		const onSubmit = vi.fn();
		const onCancel = vi.fn();
		renderWithProviders(
			<CreatePropertyForm
				onSubmit={onSubmit}
				onCancel={onCancel}
				showCancel={true}
			/>,
		);

		expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
	});

	it("does not show cancel button when showCancel is false", () => {
		const onSubmit = vi.fn();
		renderWithProviders(<CreatePropertyForm onSubmit={onSubmit} />);

		expect(
			screen.queryByRole("button", { name: /cancel/i }),
		).not.toBeInTheDocument();
	});

	it("calls onCancel when cancel button is clicked", async () => {
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

		const cancelButton = screen.getByRole("button", { name: /cancel/i });
		await user.click(cancelButton);

		expect(onCancel).toHaveBeenCalled();
	});

	it("does not call onCancel when form is submitted", async () => {
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

		const input = screen.getByPlaceholderText(/property name or address/i);
		const submitButton = screen.getByRole("button", { name: /add property/i });

		await user.type(input, "Test Property");
		await user.click(submitButton);

		expect(onSubmit).toHaveBeenCalled();
		expect(onCancel).not.toHaveBeenCalled();
	});
});
