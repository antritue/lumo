import { screen } from "@testing-library/react";
import { use } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRoomsStore } from "@/components/dashboard/rooms";
import { renderWithProviders } from "@/test/render";
import RoomDetailPage from "./page";

// Mock React's use hook
vi.mock("react", async () => {
	const actual = await vi.importActual("react");
	return {
		...actual,
		use: vi.fn(),
	};
});

const mockUse = use as ReturnType<typeof vi.fn>;

// Mock the room data
const mockRoom = {
	id: "room-1",
	propertyId: "prop-1",
	name: "Master Bedroom",
	monthlyRent: 1200,
	notes: "Large room with balcony",
};

// Helper to create params promise
const createParams = (roomId: string) => ({
	params: Promise.resolve({ roomId }),
});

describe("RoomDetailPage", () => {
	beforeEach(() => {
		useRoomsStore.setState({ rooms: [] });
		vi.clearAllMocks();
	});

	it("displays room not found when room does not exist", async () => {
		mockUse.mockReturnValue({ roomId: "non-existent" });
		renderWithProviders(<RoomDetailPage {...createParams("non-existent")} />);

		expect(
			await screen.findByRole("heading", { name: /room not found/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to properties/i }),
		).toBeInTheDocument();
	});

	it("displays room detail when room exists", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useRoomsStore.setState({
			rooms: [mockRoom],
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(
			await screen.findByRole("heading", { name: "Master Bedroom" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to properties/i }),
		).toBeInTheDocument();
	});

	it("displays additional info section when room has details", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useRoomsStore.setState({
			rooms: [mockRoom],
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(
			screen.getByRole("button", { name: /additional info/i }),
		).toBeInTheDocument();
	});

	it("displays rent payments section", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useRoomsStore.setState({
			rooms: [mockRoom],
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(screen.getByText("Payment Records")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add payment record/i }),
		).toBeInTheDocument();
	});
});
