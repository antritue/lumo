import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PropertySidebar } from "./property-sidebar";
import type { Property } from "./types";

const mockProperties = (overrides: Partial<Property>[] = []): Property[] =>
	[
		{ id: "1", name: "Sunset Villa", userId: "user-1" },
		{ id: "2", name: "Ocean View", userId: "user-1" },
		{ id: "3", name: "Maple Residences", userId: "user-1" },
		{ id: "4", name: "Pine Creek Lofts", userId: "user-1" },
		{ id: "5", name: "Oakwood Heights", userId: "user-1" },
		{ id: "6", name: "Crystal Tower", userId: "user-1" },
		{ id: "7", name: "Willow Bend", userId: "user-1" },
		{ id: "8", name: "Heritage Row", userId: "user-1" },
	].map((p, i) => ({ ...p, ...overrides[i] }));

describe("PropertySidebar", () => {
	const mockOnSelect = vi.fn();
	const mockOnAdd = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Display", () => {
		it("renders properties, search input, and add button", () => {
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add property/i }),
			).toBeInTheDocument();
			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
			expect(screen.getByText("Crystal Tower")).toBeInTheDocument();
		});
	});

	describe("Search", () => {
		it("filters properties by name", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			const input = screen.getByPlaceholderText(/search/i);
			await user.type(input, "Ocean");

			expect(screen.getByText("Ocean View")).toBeInTheDocument();
			expect(screen.queryByText("Sunset Villa")).not.toBeInTheDocument();
		});
	});

	describe("Selection", () => {
		it("calls onSelect with the clicked property", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			await user.click(screen.getByText("Sunset Villa"));

			expect(mockOnSelect).toHaveBeenCalledTimes(1);
			expect(mockOnSelect).toHaveBeenCalledWith(
				expect.objectContaining({ id: "1", name: "Sunset Villa" }),
			);
		});

		it("highlights the selected property", () => {
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId="2"
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			const selected = screen.getByText("Ocean View").closest("button");
			expect(selected?.className).toContain("ring-primary");

			const unselected = screen.getByText("Sunset Villa").closest("button");
			expect(unselected?.className).not.toContain("ring-primary");
		});
	});

	describe("Pagination", () => {
		it("shows pagination when more than 6 properties", () => {
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			expect(screen.getByText("1 / 2")).toBeInTheDocument();
			expect(screen.getByText("Next")).toBeInTheDocument();
			expect(screen.getByText("Previous")).toBeInTheDocument();
		});

		it("shows first 6 properties on page 1", () => {
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
			expect(screen.getByText("Crystal Tower")).toBeInTheDocument();
			expect(screen.queryByText("Willow Bend")).not.toBeInTheDocument();
			expect(screen.queryByText("Heritage Row")).not.toBeInTheDocument();
		});

		it("navigates to next page and back", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			await user.click(screen.getByText("Next"));

			expect(screen.queryByText("Sunset Villa")).not.toBeInTheDocument();
			expect(screen.getByText("Willow Bend")).toBeInTheDocument();
			expect(screen.getByText("Heritage Row")).toBeInTheDocument();
			expect(screen.getByText("2 / 2")).toBeInTheDocument();

			await user.click(screen.getByText("Previous"));

			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
			expect(screen.getByText("1 / 2")).toBeInTheDocument();
		});

		it("disables previous on first page and next on last page", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertySidebar
					properties={mockProperties()}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			expect(screen.getByText("Previous")).toBeDisabled();

			await user.click(screen.getByText("Next"));

			expect(screen.getByText("Next")).toBeDisabled();
		});
	});

	describe("Add button", () => {
		it("calls onAdd when clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(
				<PropertySidebar
					properties={[]}
					selectedId={null}
					onSelect={mockOnSelect}
					onAdd={mockOnAdd}
				/>,
			);

			await user.click(screen.getByRole("button", { name: /add property/i }));

			expect(mockOnAdd).toHaveBeenCalledTimes(1);
		});
	});
});
