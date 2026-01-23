import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RoomDetail } from "./room-detail";
import { useRoomsStore } from "./store";
import type { Room } from "./types";

describe("RoomDetail", () => {
	const mockRoom: Room = {
		id: "room-1",
		propertyId: "prop-1",
		name: "Room 101",
		monthlyRent: 1500000,
		notes: "Test notes",
	};

	beforeEach(() => {
		useRoomsStore.setState({ rooms: [mockRoom] });
	});

	describe("Display", () => {
		it("renders room header, info, and payments sections", () => {
			renderWithProviders(<RoomDetail room={mockRoom} />);

			expect(
				screen.getByRole("heading", { name: /room 101/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("heading", { name: /payment records/i }),
			).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("opens edit dialog when edit button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<RoomDetail room={mockRoom} />);

			await user.click(screen.getByRole("button", { name: /edit/i }));

			expect(
				screen.getByRole("heading", { name: /edit room/i }),
			).toBeInTheDocument();
		});

		it("opens delete dialog when delete button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<RoomDetail room={mockRoom} />);

			await user.click(screen.getByRole("button", { name: /delete/i }));

			expect(screen.getByText(/delete room\?/i)).toBeInTheDocument();
		});

		it("opens add payment dialog when add payment is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<RoomDetail room={mockRoom} />);

			await user.click(screen.getByRole("button", { name: /add payment/i }));

			expect(screen.getByText(/payment period/i)).toBeInTheDocument();
		});
	});
});
