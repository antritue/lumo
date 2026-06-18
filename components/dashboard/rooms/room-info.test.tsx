import { screen } from "@testing-library/react";
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

	it("renders nothing when room has no notes", () => {
		const roomWithoutNotes: Room = {
			...mockRoom,
			notes: null,
		};
		const { container } = renderWithProviders(
			<RoomInfo room={roomWithoutNotes} />,
		);

		expect(container.firstChild).toBeNull();
	});

	it("renders notes when present", () => {
		renderWithProviders(<RoomInfo room={mockRoom} />);

		expect(screen.getByText("Test notes")).toBeInTheDocument();
		expect(screen.queryByText(/1[,.]500[,.]000/)).not.toBeInTheDocument();
	});

	it("renders nothing when monthlyRent is set but notes are null", () => {
		const roomWithRentOnly: Room = { ...mockRoom, notes: null };
		const { container } = renderWithProviders(
			<RoomInfo room={roomWithRentOnly} />,
		);

		expect(container.firstChild).toBeNull();
	});
});
