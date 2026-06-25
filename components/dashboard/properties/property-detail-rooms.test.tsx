import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { useRoomsStore } from "../rooms/store";
import type { Room } from "../rooms/types";
import { PropertyDetailRooms } from "./property-detail-rooms";

const mockRoom = (overrides: Partial<Room> = {}): Room => ({
	id: "1",
	propertyId: "prop-1",
	name: "Room 101",
	monthlyRent: null,
	notes: null,
	...overrides,
});

describe("PropertyDetailRooms", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useRoomsStore.setState({
			rooms: [],
			isRoomsLoading: false,
			isRoomsFetchFailed: false,
			fetchRoomsByPropertyId: vi.fn(),
			createRoom: vi.fn(),
			updateRoom: vi.fn(),
			deleteRoom: vi.fn(),
		});
	});

	describe("Display", () => {
		it("shows section title and room count", () => {
			useRoomsStore.setState({
				rooms: [mockRoom(), mockRoom({ id: "2", name: "Room 102" })],
			});

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			expect(screen.getByText("Rooms")).toBeInTheDocument();
			expect(screen.getByText("2")).toBeInTheDocument();
		});

		it("shows loading spinner when rooms are loading", () => {
			useRoomsStore.setState({
				isRoomsLoading: true,
			});

			const { container } = renderWithProviders(
				<PropertyDetailRooms propertyId="prop-1" />,
			);

			expect(container.querySelector(".animate-spin")).toBeInTheDocument();
		});

		it("shows error state with retry button on fetch failure", () => {
			useRoomsStore.setState({
				isRoomsFetchFailed: true,
				fetchRoomsByPropertyId: vi.fn(),
			});

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			expect(
				screen.getByRole("heading", { name: /failed to load data/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /try again/i }),
			).toBeInTheDocument();
		});

		it("shows multiple rooms", () => {
			useRoomsStore.setState({
				rooms: [
					mockRoom(),
					mockRoom({ id: "2", name: "Room 102" }),
					mockRoom({ id: "3", name: "Room 103" }),
				],
			});

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			expect(screen.getByText("Room 101")).toBeInTheDocument();
			expect(screen.getByText("Room 102")).toBeInTheDocument();
			expect(screen.getByText("Room 103")).toBeInTheDocument();
		});

		it("shows empty state when no rooms exist", () => {
			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			expect(screen.getByText(/no rooms yet/i)).toBeInTheDocument();
			expect(screen.getByText(/add your first room/i)).toBeInTheDocument();
		});

		it("only shows rooms matching the propertyId", () => {
			useRoomsStore.setState({
				rooms: [
					mockRoom(),
					mockRoom({ id: "2", propertyId: "other-prop", name: "Other Room" }),
				],
			});

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			expect(screen.getByText("Room 101")).toBeInTheDocument();
			expect(screen.queryByText("Other Room")).not.toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("opens add room dialog on add button click", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			await user.click(screen.getByRole("button", { name: /add room/i }));

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("textbox", { name: /room name/i }),
			).toBeInTheDocument();
		});

		it("opens edit room dialog when edit button is clicked", async () => {
			const user = userEvent.setup();
			useRoomsStore.setState({
				rooms: [mockRoom()],
			});

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			const roomCard = screen.getByText("Room 101").closest("a")
				?.parentElement as HTMLElement;
			const kebabButton = within(roomCard).getByRole("button");
			await user.click(kebabButton);

			await user.click(screen.getByRole("button", { name: /edit/i }));

			const dialog = screen.getByRole("dialog");
			expect(within(dialog).getByDisplayValue("Room 101")).toBeInTheDocument();
		});

		it("opens delete dialog when delete button is clicked", async () => {
			const user = userEvent.setup();
			useRoomsStore.setState({
				rooms: [mockRoom()],
			});

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			const roomCard = screen.getByText("Room 101").closest("a")
				?.parentElement as HTMLElement;
			const kebabButton = within(roomCard).getByRole("button");
			await user.click(kebabButton);

			await user.click(screen.getByRole("button", { name: /delete/i }));

			expect(
				screen.getByRole("heading", { name: /delete room/i }),
			).toBeInTheDocument();
		});

		it("creates room on save in add mode", async () => {
			const createRoom = vi.fn().mockResolvedValue(undefined);
			useRoomsStore.setState({ createRoom });
			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			await user.click(screen.getByRole("button", { name: /add room/i }));

			const dialog = screen.getByRole("dialog");
			const nameInput = within(dialog).getByRole("textbox", {
				name: /room name/i,
			});
			const form = within(dialog)
				.getByRole("button", { name: /add room/i })
				.closest("form");
			expect(form).not.toBeNull();

			await user.type(nameInput, "New Room");
			fireEvent.submit(form as HTMLFormElement);
			await act(async () => {});

			expect(createRoom).toHaveBeenCalledWith("prop-1", "New Room", null, null);
		});

		it("deletes room on delete confirm", async () => {
			const deleteRoom = vi.fn().mockResolvedValue(undefined);
			useRoomsStore.setState({
				rooms: [mockRoom()],
				deleteRoom,
			});

			const user = userEvent.setup();

			renderWithProviders(<PropertyDetailRooms propertyId="prop-1" />);

			const roomCard = screen.getByText("Room 101").closest("a")
				?.parentElement as HTMLElement;
			const kebabButton = within(roomCard).getByRole("button");
			await user.click(kebabButton);

			await user.click(screen.getByRole("button", { name: /delete/i }));

			const dialog = screen.getByRole("dialog");
			const confirmButton = within(dialog).getByRole("button", {
				name: /delete room/i,
			});
			await user.click(confirmButton);

			expect(deleteRoom).toHaveBeenCalledWith("1");
		});
	});
});
