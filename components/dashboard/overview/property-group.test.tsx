import { screen, within } from "@testing-library/react";
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
			monthlyRent: 3_200_000,
			payment: {
				id: "pay-1",
				roomId: "room-1",
				period: "2026-08",
				rentAmount: 3_200_000,
				status: "paid",
				payerTenantId: null,
				payerName: null,
			},
			charges: [],
			total: 3_200_000,
		},
		{
			id: "room-2",
			propertyId: "prop-1",
			name: "Room 102",
			monthlyRent: 2_800_000,
			payment: null,
			charges: [],
			total: 0,
		},
	],
	paidCount: 1,
	...overrides,
});

const renderGroup = (
	property: OverviewProperty,
	vacantRoomIds: ReadonlySet<string> = new Set<string>(),
) =>
	renderWithProviders(
		<PropertyGroup property={property} vacantRoomIds={vacantRoomIds} />,
	);

describe("PropertyGroup", () => {
	it("renders the property name and paid chip", () => {
		renderGroup(mockProperty());

		expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
		expect(screen.getByText(/1\/2 paid/i)).toBeInTheDocument();
	});

	it("colors the paid chip amber while partially paid", () => {
		const { container } = renderGroup(mockProperty());

		const chip = container.querySelector(".rounded-full");
		expect(chip?.className).toContain("bg-amber-500/10");
	});

	it("colors the paid chip green when fully paid", () => {
		const { container } = renderGroup(mockProperty({ paidCount: 2 }));

		const chip = container.querySelector(".rounded-full");
		expect(chip?.className).toContain("bg-green-500/10");
	});

	it("renders room rows", () => {
		renderGroup(mockProperty());

		expect(screen.getByText("Room 101")).toBeInTheDocument();
		expect(screen.getByText("Room 102")).toBeInTheDocument();
	});

	it("marks only the vacant room", () => {
		renderGroup(mockProperty(), new Set(["room-2"]));

		const occupiedRow = screen.getByRole("link", { name: /room 101/i });
		const vacantRow = screen.getByRole("link", { name: /room 102/i });

		expect(within(vacantRow).getByText("Vacant")).toBeInTheDocument();
		expect(within(occupiedRow).queryByText("Vacant")).not.toBeInTheDocument();
	});

	it("collapses and expands on header click", async () => {
		const user = userEvent.setup();
		renderGroup(mockProperty());

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
