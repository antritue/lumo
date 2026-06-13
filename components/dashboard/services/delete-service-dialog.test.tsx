import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeleteServiceDialog } from "./delete-service-dialog";
import type { Service } from "./types";

describe("DeleteServiceDialog", () => {
	const mockService: Service = {
		id: "svc-1",
		userId: "user-1",
		name: "WiFi",
		unitLabel: null,
		pricingType: "flat",
		flatAmount: 15,
		unitPrice: null,
	};
	const mockOnOpenChange = vi.fn();
	const mockOnDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("does not display when closed", () => {
			renderWithProviders(
				<DeleteServiceDialog
					service={mockService}
					open={false}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("displays dialog with all elements when open", () => {
			renderWithProviders(
				<DeleteServiceDialog
					service={mockService}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const heading = within(dialog).getByRole("heading", {
				name: /delete service/i,
			});

			expect(heading).toBeInTheDocument();
			expect(heading.querySelector("svg")).toBeInTheDocument();
			expect(
				within(dialog).getByText(/permanently delete "WiFi"/i),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("button", { name: /delete service/i }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("button", { name: /cancel/i }),
			).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls onDelete with service id when delete button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeleteServiceDialog
					service={mockService}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const deleteButton = within(dialog).getByRole("button", {
				name: /delete service/i,
			});

			await user.click(deleteButton);

			expect(mockOnDelete).toHaveBeenCalledWith("svc-1");
		});

		it("shows loading state while deleting", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeleteServiceDialog
					service={mockService}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const deleteButton = screen.getByRole("button", {
				name: /delete service/i,
			});
			await user.click(deleteButton);

			expect(screen.getByTestId("service-delete-loader")).toBeInTheDocument();
			expect(screen.queryByText(/permanently delete/i)).not.toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: /cancel/i }),
			).not.toBeInTheDocument();
		});

		it("shows error dialog on delete failure", async () => {
			const user = userEvent.setup();
			const onDelete = vi.fn().mockRejectedValue(new Error("API error"));
			renderWithProviders(
				<DeleteServiceDialog
					service={mockService}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={onDelete}
				/>,
			);

			const deleteButton = screen.getByRole("button", {
				name: /delete service/i,
			});
			await user.click(deleteButton);

			expect(
				await screen.findByText(/problem deleting this service/i),
			).toBeInTheDocument();
		});

		it("closes dialog without calling onDelete when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<DeleteServiceDialog
					service={mockService}
					open={true}
					onOpenChange={mockOnOpenChange}
					onDelete={mockOnDelete}
				/>,
			);

			const dialog = screen.getByRole("dialog");
			const cancelButton = within(dialog).getByRole("button", {
				name: /cancel/i,
			});

			await user.click(cancelButton);

			expect(mockOnOpenChange).toHaveBeenCalledWith(false);
			expect(mockOnDelete).not.toHaveBeenCalled();
		});
	});
});
