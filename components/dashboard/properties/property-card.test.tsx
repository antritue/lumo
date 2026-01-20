import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { useRoomsStore } from "../rooms/store";
import { PropertyCard } from "./property-card";
import { usePropertiesStore } from "./store";
import type { Property } from "./types";

describe("PropertyCard", () => {
	const mockProperty: Property = {
		id: "prop-1",
		name: "Sunset Villa",
	};

	beforeEach(() => {
		usePropertiesStore.setState({ properties: [] });
		useRoomsStore.setState({ rooms: [] });
	});

	describe("Display", () => {
		it("displays property name", () => {
			renderWithProviders(<PropertyCard property={mockProperty} />);

			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
		});

		it("displays room count when property has no rooms", () => {
			renderWithProviders(<PropertyCard property={mockProperty} />);

			expect(screen.getByText(/no rooms/i)).toBeInTheDocument();
		});

		it("displays room count when property has rooms", () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "room-1",
						propertyId: "prop-1",
						name: "Room 101",
						monthlyRent: null,
						notes: null,
					},
					{
						id: "room-2",
						propertyId: "prop-1",
						name: "Room 102",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			renderWithProviders(<PropertyCard property={mockProperty} />);

			expect(screen.getByText(/2 rooms/i)).toBeInTheDocument();
		});

		it("displays room count for single room", () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "room-1",
						propertyId: "prop-1",
						name: "Room 101",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			renderWithProviders(<PropertyCard property={mockProperty} />);

			expect(screen.getByText(/1 room/i)).toBeInTheDocument();
		});

		it("displays edit and delete buttons", () => {
			renderWithProviders(<PropertyCard property={mockProperty} />);

			expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /delete/i }),
			).toBeInTheDocument();
		});
	});

	describe("Expand/Collapse Behavior", () => {
		it("starts in expanded state", () => {
			renderWithProviders(<PropertyCard property={mockProperty} />);

			const toggleButton = screen.getByRole("button", { expanded: true });
			expect(toggleButton).toBeInTheDocument();
		});

		it("collapses when user clicks expand/collapse button", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyCard property={mockProperty} />);

			const toggleButton = screen.getByRole("button", { expanded: true });
			await user.click(toggleButton);

			expect(
				screen.getByRole("button", { expanded: false }),
			).toBeInTheDocument();
		});

		it("expands when user clicks collapsed card", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyCard property={mockProperty} />);

			// First collapse
			const toggleButton = screen.getByRole("button", { expanded: true });
			await user.click(toggleButton);

			// Then expand again
			const collapsedButton = screen.getByRole("button", { expanded: false });
			await user.click(collapsedButton);

			expect(
				screen.getByRole("button", { expanded: true }),
			).toBeInTheDocument();
		});
	});

	describe("Action Callbacks", () => {
		it("calls onEdit when edit button is clicked", async () => {
			const user = userEvent.setup();
			const onEdit = vi.fn();
			renderWithProviders(
				<PropertyCard property={mockProperty} onEdit={onEdit} />,
			);

			const editButton = screen.getByRole("button", { name: /edit/i });
			await user.click(editButton);

			expect(onEdit).toHaveBeenCalledWith(mockProperty);
		});

		it("calls onDelete when delete button is clicked", async () => {
			const user = userEvent.setup();
			const onDelete = vi.fn();
			renderWithProviders(
				<PropertyCard property={mockProperty} onDelete={onDelete} />,
			);

			const deleteButton = screen.getByRole("button", { name: /delete/i });
			await user.click(deleteButton);

			expect(onDelete).toHaveBeenCalledWith(mockProperty);
		});
	});
});
