import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RoomDetailHeader } from "./room-detail-header";
import type { Room } from "./types";

vi.mock("next/navigation", () => ({
	useSearchParams: () => new URLSearchParams(),
}));

describe("RoomDetailHeader", () => {
	const mockRoom: Room = {
		id: "1",
		propertyId: "prop-1",
		name: "Master Bedroom",
		monthlyRent: 1500000,
		notes: "Corner unit",
	};

	describe("Display", () => {
		it("displays room name and action buttons", () => {
			const onEdit = vi.fn();
			const onDelete = vi.fn();

			renderWithProviders(
				<RoomDetailHeader
					room={mockRoom}
					isVacant={false}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			expect(
				screen.getByRole("heading", { name: /master bedroom/i }),
			).toBeInTheDocument();
			expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /delete/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("link", { name: /back to properties/i }),
			).toBeInTheDocument();
		});

		it("shows a vacant badge when the room is vacant", () => {
			renderWithProviders(
				<RoomDetailHeader
					room={mockRoom}
					isVacant
					onEdit={vi.fn()}
					onDelete={vi.fn()}
				/>,
			);

			expect(screen.getByText("Vacant")).toBeInTheDocument();
		});

		it("does not show a vacant badge when the room is occupied", () => {
			renderWithProviders(
				<RoomDetailHeader
					room={mockRoom}
					isVacant={false}
					onEdit={vi.fn()}
					onDelete={vi.fn()}
				/>,
			);

			expect(screen.queryByText("Vacant")).not.toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls callbacks when action buttons clicked", async () => {
			const user = userEvent.setup();
			const onEdit = vi.fn();
			const onDelete = vi.fn();

			renderWithProviders(
				<RoomDetailHeader
					room={mockRoom}
					isVacant={false}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /edit/i }));
			expect(onEdit).toHaveBeenCalled();

			await user.click(screen.getByRole("button", { name: /delete/i }));
			expect(onDelete).toHaveBeenCalled();
		});
	});
});
