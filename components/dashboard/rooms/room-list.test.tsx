import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RoomList } from "./room-list";
import { useRoomsStore } from "./store";
import type { Room } from "./types";

describe("RoomList", () => {
	const mockRooms: Room[] = [
		{
			id: "1",
			propertyId: "prop-1",
			name: "Room 101",
			monthlyRent: 1200000,
			notes: null,
		},
		{
			id: "2",
			propertyId: "prop-1",
			name: "Room 102",
			monthlyRent: 1500000,
			notes: null,
		},
	];

	beforeEach(() => {
		useRoomsStore.setState({ rooms: [] });
	});

	describe("Display", () => {
		it("displays empty state when no rooms", () => {
			renderWithProviders(<RoomList propertyId="prop-1" rooms={[]} />);

			expect(
				screen.getByRole("button", { name: /add room/i }),
			).toBeInTheDocument();
		});

		it("displays room list with action buttons", () => {
			renderWithProviders(<RoomList propertyId="prop-1" rooms={mockRooms} />);

			expect(screen.getByText("Room 101")).toBeInTheDocument();
			expect(screen.getByText("Room 102")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add another/i }),
			).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("shows and submits create form", async () => {
			const user = userEvent.setup();
			renderWithProviders(<RoomList propertyId="prop-1" rooms={[]} />);

			await user.click(screen.getByRole("button", { name: /add room/i }));
			expect(screen.getByPlaceholderText(/room name/i)).toBeInTheDocument();

			await user.type(screen.getByPlaceholderText(/room name/i), "New Room");
			await user.click(screen.getByRole("button", { name: /add room/i }));

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0].name).toBe("New Room");
		});

		it("opens edit dialog for room", async () => {
			const user = userEvent.setup();
			renderWithProviders(<RoomList propertyId="prop-1" rooms={mockRooms} />);

			const editButtons = screen.getAllByRole("button", { name: /edit/i });
			await user.click(editButtons[0]);

			expect(screen.getByRole("dialog")).toBeInTheDocument();
			expect(screen.getByDisplayValue("Room 101")).toBeInTheDocument();
		});

		it("opens delete dialog for room", async () => {
			const user = userEvent.setup();
			renderWithProviders(<RoomList propertyId="prop-1" rooms={mockRooms} />);

			const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
			await user.click(deleteButtons[0]);

			const dialog = screen.getByRole("dialog");
			expect(dialog).toBeInTheDocument();
			expect(
				within(dialog).getByText(/permanently delete/i),
			).toBeInTheDocument();
		});
	});
});
