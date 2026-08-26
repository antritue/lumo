import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { PropertyGroup } from "./property-group";
import type { OverviewProperty } from "./types";

const mockProperty = (
	overrides: Partial<OverviewProperty> = {},
): OverviewProperty => ({
	id: "prop-1",
	name: "Sunset Villa",
	rooms: [
		{
			id: "room-1",
			propertyId: "prop-1",
			name: "Room 101",
			monthlyRent: 800,
			payment: {
				id: "pay-1",
				roomId: "room-1",
				period: "2026-08",
				rentAmount: 800,
				status: "paid",
			},
			charges: [],
			total: 800,
		},
		{
			id: "room-2",
			propertyId: "prop-1",
			name: "Room 102",
			monthlyRent: 700,
			payment: null,
			charges: [],
			total: 0,
		},
	],
	paidCount: 1,
	...overrides,
});

describe("PropertyGroup", () => {
	it("renders the property name, room count and paid chip", () => {
		renderWithProviders(<PropertyGroup property={mockProperty()} />);

		expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
		expect(screen.getByText(/2 rooms/i)).toBeInTheDocument();
		expect(screen.getByText(/1\/2 paid/i)).toBeInTheDocument();
	});

	it("colors the paid chip amber while partially paid", () => {
		const { container } = renderWithProviders(
			<PropertyGroup property={mockProperty()} />,
		);

		const chip = container.querySelector(".rounded-full");
		expect(chip?.className).toContain("bg-amber-500/10");
	});

	it("colors the paid chip green when fully paid", () => {
		const { container } = renderWithProviders(
			<PropertyGroup property={mockProperty({ paidCount: 2 })} />,
		);

		const chip = container.querySelector(".rounded-full");
		expect(chip?.className).toContain("bg-green-500/10");
	});

	it("renders room rows", () => {
		renderWithProviders(<PropertyGroup property={mockProperty()} />);

		expect(screen.getByText("Room 101")).toBeInTheDocument();
		expect(screen.getByText("Room 102")).toBeInTheDocument();
	});

	it("collapses and expands on header click", async () => {
		const user = userEvent.setup();
		renderWithProviders(<PropertyGroup property={mockProperty()} />);

		expect(screen.getByText("Room 101")).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /collapse sunset villa/i }),
		);
		expect(screen.queryByText("Room 101")).not.toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /expand sunset villa/i }),
		);
		expect(screen.getByText("Room 101")).toBeInTheDocument();
	});
});
