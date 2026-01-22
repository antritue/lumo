import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { useRoomsStore } from "../rooms/store";
import { PropertyCard } from "./property-card";
import { usePropertiesStore } from "./store";
import type { Property } from "./types";

describe("PropertyCard", () => {
	const mockProperty: Property = { id: "1", name: "Sunset Villa" };

	beforeEach(() => {
		usePropertiesStore.setState({ properties: [] });
		useRoomsStore.setState({ rooms: [] });
	});

	describe("Display", () => {
		it("displays property name and room count", () => {
			useRoomsStore.setState({
				rooms: [
					{
						id: "1",
						propertyId: "1",
						name: "Room 101",
						monthlyRent: null,
						notes: null,
					},
					{
						id: "2",
						propertyId: "1",
						name: "Room 102",
						monthlyRent: null,
						notes: null,
					},
				],
			});

			renderWithProviders(<PropertyCard property={mockProperty} />);

			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
			expect(screen.getByText(/2 rooms/i)).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("toggles expand/collapse state", async () => {
			const user = userEvent.setup();
			renderWithProviders(<PropertyCard property={mockProperty} />);

			const toggleButton = screen.getByRole("button", { expanded: true });
			await user.click(toggleButton);
			expect(
				screen.getByRole("button", { expanded: false }),
			).toBeInTheDocument();

			await user.click(screen.getByRole("button", { expanded: false }));
			expect(
				screen.getByRole("button", { expanded: true }),
			).toBeInTheDocument();
		});

		it("calls callbacks when action buttons clicked", async () => {
			const user = userEvent.setup();
			const onEdit = vi.fn();
			const onDelete = vi.fn();
			renderWithProviders(
				<PropertyCard
					property={mockProperty}
					onEdit={onEdit}
					onDelete={onDelete}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /edit/i }));
			expect(onEdit).toHaveBeenCalledWith(mockProperty);

			await user.click(screen.getByRole("button", { name: /delete/i }));
			expect(onDelete).toHaveBeenCalledWith(mockProperty);
		});
	});
});
