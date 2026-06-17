import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { useRoomsStore } from "../rooms/store";
import { PropertyDetail } from "./property-detail";
import type { Property } from "./types";

const mockProperty: Property = {
	id: "1",
	name: "Sunset Villa",
	userId: "user-1",
};

describe("PropertyDetail", () => {
	const onEdit = vi.fn();
	const onDelete = vi.fn();
	const onBack = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		useRoomsStore.setState({
			rooms: [],
			loadingPropertyIds: [],
			failedPropertyIds: [],
			fetchRoomsByPropertyId: vi.fn(),
		});
	});

	describe("Display", () => {
		it("shows room count", () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "r1",
						propertyId: "1",
						name: "Room 1",
						monthlyRent: null,
						notes: null,
					},
					{
						id: "r2",
						propertyId: "1",
						name: "Room 2",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			renderWithProviders(
				<PropertyDetail
					property={mockProperty}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			expect(screen.getByText(/2 rooms/i)).toBeInTheDocument();
		});

		it("shows back button when onBack is provided", () => {
			renderWithProviders(
				<PropertyDetail
					property={mockProperty}
					onEdit={onEdit}
					onDelete={onDelete}
					onBack={onBack}
				/>,
			);

			expect(
				screen.getByRole("button", { name: /back to properties/i }),
			).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("calls onEdit when edit button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertyDetail
					property={mockProperty}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /edit/i }));

			expect(onEdit).toHaveBeenCalledWith(mockProperty);
		});

		it("calls onDelete when delete button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertyDetail
					property={mockProperty}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /delete/i }));

			expect(onDelete).toHaveBeenCalledWith(mockProperty);
		});

		it("calls onBack when back button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertyDetail
					property={mockProperty}
					onEdit={onEdit}
					onDelete={onDelete}
					onBack={onBack}
				/>,
			);

			await user.click(
				screen.getByRole("button", { name: /back to properties/i }),
			);

			expect(onBack).toHaveBeenCalledTimes(1);
		});
	});
});
