import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RoomStatusRow } from "./room-status-row";
import type { OverviewRoom } from "./types";

const mockOverviewRoom = (
	overrides: Partial<OverviewRoom> = {},
): OverviewRoom => ({
	id: "room-1",
	propertyId: "prop-1",
	name: "Room 101",
	monthlyRent: 800,
	payment: null,
	charges: [],
	total: 0,
	...overrides,
});

describe("RoomStatusRow", () => {
	it("renders the room name and monthly rent", () => {
		renderWithProviders(<RoomStatusRow room={mockOverviewRoom()} />);

		expect(screen.getByText("Room 101")).toBeInTheDocument();
		expect(screen.getByText("$800")).toBeInTheDocument();
	});

	it("shows the payment total including charges when a payment exists", () => {
		renderWithProviders(
			<RoomStatusRow
				room={mockOverviewRoom({
					payment: {
						id: "pay-1",
						roomId: "room-1",
						period: "2026-08",
						rentAmount: 2000,
						status: "paid",
					},
					charges: [
						{
							serviceId: "svc-1",
							serviceName: "Internet",
							pricingType: "flat",
							total: 140,
						},
					],
					total: 2140,
				})}
			/>,
		);

		expect(screen.getByText("$2,140")).toBeInTheDocument();
		expect(screen.queryByText("$2,000")).not.toBeInTheDocument();
	});

	it("renders a paid badge", () => {
		renderWithProviders(
			<RoomStatusRow
				room={mockOverviewRoom({
					payment: {
						id: "pay-1",
						roomId: "room-1",
						period: "2026-08",
						rentAmount: 800,
						status: "paid",
					},
				})}
			/>,
		);

		expect(screen.getByRole("button", { name: /paid/i })).toBeInTheDocument();
	});

	it("renders a pending badge", () => {
		renderWithProviders(
			<RoomStatusRow
				room={mockOverviewRoom({
					payment: {
						id: "pay-1",
						roomId: "room-1",
						period: "2026-08",
						rentAmount: 800,
						status: "pending",
					},
				})}
			/>,
		);

		expect(
			screen.getByRole("button", { name: /pending/i }),
		).toBeInTheDocument();
	});

	it("renders a not-recorded badge when there is no payment", () => {
		renderWithProviders(<RoomStatusRow room={mockOverviewRoom()} />);

		expect(screen.getByText(/not recorded/i)).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /paid/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /pending/i }),
		).not.toBeInTheDocument();
	});

	it("links to the room detail page", () => {
		renderWithProviders(<RoomStatusRow room={mockOverviewRoom()} />);

		expect(screen.getByRole("link", { name: /room 101/i })).toHaveAttribute(
			"href",
			"/dashboard/rooms/room-1",
		);
	});
});
