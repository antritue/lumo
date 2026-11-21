import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTenantsStore } from "@/components/dashboard/tenants/store";
import { renderWithProviders } from "@/test/render";
import { DeleteRoomDialog } from "./delete-room-dialog";
import type { Room } from "./types";

describe("DeleteRoomDialog", () => {
	const mockRoom: Room = {
		id: "1",
		propertyId: "prop-1",
		name: "Master Bedroom",
		monthlyRent: 1500,
		notes: null,
	};

	beforeEach(() => {
		useTenantsStore.setState({ tenants: [] });
	});

	describe("Display", () => {
		it("displays confirmation message with room name", () => {
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onDelete={vi.fn()}
				/>,
			);

			expect(
				screen.getByRole("heading", { name: /delete/i }),
			).toBeInTheDocument();
			expect(screen.getByText(/master bedroom/i)).toBeInTheDocument();
		});

		it("warns that the assigned tenant will be unassigned", () => {
			useTenantsStore.setState({
				tenants: [
					{
						id: "t1",
						userId: "u1",
						roomId: "1",
						fullName: "Anh Nguyen",
						phone: null,
						email: null,
						notes: null,
					},
				],
			});

			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onDelete={vi.fn()}
				/>,
			);

			expect(screen.getByText(/anh nguyen/i)).toBeInTheDocument();
		});

		it("does not warn when no tenant is assigned", () => {
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onDelete={vi.fn()}
				/>,
			);

			expect(screen.queryByText(/will be unassigned/i)).not.toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("deletes room on confirmation", async () => {
			const user = userEvent.setup();
			const onDelete = vi.fn();
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onDelete={onDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /delete/i }));
			expect(screen.getByTestId("room-delete-loader")).toBeInTheDocument();
			expect(onDelete).toHaveBeenCalledWith("1");
			expect(screen.getByTestId("room-delete-loader")).toBeInTheDocument();
		});

		it("closes dialog on cancel", async () => {
			const user = userEvent.setup();
			const onOpenChange = vi.fn();
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={onOpenChange}
					onDelete={vi.fn()}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /cancel/i }));
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});

		it("shows error dialog on delete failure", async () => {
			const user = userEvent.setup();
			const onDelete = vi.fn().mockRejectedValue(new Error("API error"));
			renderWithProviders(
				<DeleteRoomDialog
					room={mockRoom}
					open={true}
					onOpenChange={vi.fn()}
					onDelete={onDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /delete/i }));
			expect(
				await screen.findByText(/problem deleting this room/i),
			).toBeInTheDocument();
		});
	});
});
