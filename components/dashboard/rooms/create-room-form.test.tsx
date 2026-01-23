import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { CreateRoomForm } from "./create-room-form";

describe("CreateRoomForm", () => {
	describe("Display", () => {
		it("displays required and optional fields", () => {
			const onSubmit = vi.fn();
			renderWithProviders(<CreateRoomForm onSubmit={onSubmit} />);

			expect(screen.getByPlaceholderText(/room name/i)).toBeInTheDocument();
			expect(screen.getByPlaceholderText(/monthly rent/i)).toBeInTheDocument();
			expect(screen.getByPlaceholderText(/notes/i)).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add room/i }),
			).toBeInTheDocument();
		});

		it("conditionally displays cancel button", () => {
			const onSubmit = vi.fn();
			const { rerender } = renderWithProviders(
				<CreateRoomForm onSubmit={onSubmit} />,
			);

			expect(
				screen.queryByRole("button", { name: /cancel/i }),
			).not.toBeInTheDocument();

			rerender(
				<CreateRoomForm
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
		it("disables submit button for empty room name", async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			renderWithProviders(<CreateRoomForm onSubmit={onSubmit} />);

			const submitButton = screen.getByRole("button", { name: /add room/i });
			expect(submitButton).toBeDisabled();

			await user.type(screen.getByPlaceholderText(/room name/i), "   ");
			expect(submitButton).toBeDisabled();

			await user.clear(screen.getByPlaceholderText(/room name/i));
			await user.type(screen.getByPlaceholderText(/room name/i), "Room 101");
			expect(submitButton).toBeEnabled();
		});
	});

	describe("Interactions", () => {
		it("submits with required fields and clears form", async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			renderWithProviders(<CreateRoomForm onSubmit={onSubmit} />);

			const nameInput = screen.getByPlaceholderText(/room name/i);
			await user.type(nameInput, "  Master Bedroom  ");
			await user.click(screen.getByRole("button", { name: /add room/i }));

			expect(onSubmit).toHaveBeenCalledWith("Master Bedroom", null, null);
			expect(nameInput).toHaveValue("");
		});

		it("calls onCancel when cancel button clicked", async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			const onCancel = vi.fn();
			renderWithProviders(
				<CreateRoomForm
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
