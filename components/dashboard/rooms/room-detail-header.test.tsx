import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RoomDetailHeader } from "./room-detail-header";
import type { Room } from "./types";

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
	});

	describe("Interactions", () => {
		it("calls callbacks when action buttons clicked", async () => {
			const user = userEvent.setup();
			const onEdit = vi.fn();
			const onDelete = vi.fn();

			renderWithProviders(
				<RoomDetailHeader
					room={mockRoom}
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
