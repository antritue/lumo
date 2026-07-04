import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeleteAccountDialog } from "./delete-account-dialog";

describe("DeleteAccountDialog", () => {
	const mockOnOpenChange = vi.fn();
	const mockOnConfirm = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockOnConfirm.mockResolvedValue(undefined);
	});

	const renderDialog = () =>
		renderWithProviders(
			<DeleteAccountDialog
				open={true}
				onOpenChange={mockOnOpenChange}
				onConfirm={mockOnConfirm}
			/>,
		);

	const getConfirmButton = () =>
		within(screen.getByRole("dialog")).getByRole("button", {
			name: /delete account/i,
		});

	it("renders with confirm button disabled by default", () => {
		renderDialog();

		expect(getConfirmButton()).toBeDisabled();
	});

	it("enables confirm button only after typing DELETE", async () => {
		const user = userEvent.setup();
		renderDialog();

		const input = screen.getByTestId("delete-confirm-input");
		await user.type(input, "DEL");

		expect(getConfirmButton()).toBeDisabled();

		await user.type(input, "ETE");
		expect(getConfirmButton()).toBeEnabled();
	});

	it("calls onConfirm and closes the dialog", async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByTestId("delete-confirm-input"), "DELETE");
		await user.click(getConfirmButton());

		expect(mockOnConfirm).toHaveBeenCalledOnce();
		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});

	it("shows spinner while submitting, then closes on success", async () => {
		let resolveFetch!: () => void;
		mockOnConfirm.mockReturnValueOnce(
			new Promise<void>((resolve) => {
				resolveFetch = resolve;
			}),
		);

		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByTestId("delete-confirm-input"), "DELETE");
		await user.click(getConfirmButton());

		expect(screen.getByTestId("delete-account-loader")).toBeInTheDocument();

		resolveFetch();
		await waitFor(() => {
			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
		});
	});

	it("shows error dialog when onConfirm fails", async () => {
		mockOnConfirm.mockRejectedValueOnce(new Error("Failed"));

		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByTestId("delete-confirm-input"), "DELETE");
		await user.click(getConfirmButton());

		await waitFor(() => {
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});
		expect(mockOnConfirm).toHaveBeenCalledOnce();
	});

	it("closes the dialog when cancel is clicked", async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.click(
			within(screen.getByRole("dialog")).getByRole("button", {
				name: /cancel/i,
			}),
		);

		expect(mockOnOpenChange).toHaveBeenCalledWith(false);
	});
});
