import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RoomInfo } from "./room-info";
import type { Room } from "./types";

describe("RoomInfo", () => {
	const mockRoom: Room = {
		id: "1",
		propertyId: "prop-1",
		name: "Room 101",
		monthlyRent: 1500000,
		notes: "Test notes",
	};

	it("renders nothing when room has no details", () => {
		const roomWithoutDetails: Room = {
			...mockRoom,
			monthlyRent: null,
			notes: null,
		};
		const { container } = renderWithProviders(
			<RoomInfo room={roomWithoutDetails} />,
		);

		expect(container.firstChild).toBeNull();
	});

	it("starts collapsed by default", () => {
		renderWithProviders(<RoomInfo room={mockRoom} />);

		expect(screen.getByRole("button", { expanded: false })).toBeInTheDocument();
		expect(screen.queryByText("Test notes")).not.toBeInTheDocument();
	});

	it("expands to show all details and collapses again", async () => {
		const user = userEvent.setup();
		renderWithProviders(<RoomInfo room={mockRoom} />);

		await user.click(screen.getByRole("button", { expanded: false }));

		expect(screen.getByText(/1[,.]500[,.]000/)).toBeInTheDocument();
		expect(screen.getByText("Test notes")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { expanded: true }));
		expect(screen.queryByText("Test notes")).not.toBeInTheDocument();
	});

	it("shows only rent when notes are null", async () => {
		const user = userEvent.setup();
		const roomWithRentOnly: Room = { ...mockRoom, notes: null };
		renderWithProviders(<RoomInfo room={roomWithRentOnly} />);

		await user.click(screen.getByRole("button", { expanded: false }));

		expect(screen.getByText(/1[,.]500[,.]000/)).toBeInTheDocument();
		expect(screen.queryByText(/notes/i)).not.toBeInTheDocument();
	});

	it("shows only notes when rent is null", async () => {
		const user = userEvent.setup();
		const roomWithNotesOnly: Room = { ...mockRoom, monthlyRent: null };
		renderWithProviders(<RoomInfo room={roomWithNotesOnly} />);

		await user.click(screen.getByRole("button", { expanded: false }));

		expect(screen.getByText("Test notes")).toBeInTheDocument();
		expect(screen.queryByText(/monthly rent/i)).not.toBeInTheDocument();
	});
});
