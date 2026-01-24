import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments";
import { renderWithProviders } from "@/test/render";
import { RoomItem } from "./room-item";
import type { Room } from "./types";

describe("RoomItem", () => {
	const mockRoom: Room = {
		id: "1",
		propertyId: "prop-1",
		name: "Master Bedroom",
		monthlyRent: 1500000,
		notes: null,
	};

	describe("Display", () => {
		it("displays room name and formatted rent", () => {
			renderWithProviders(<RoomItem room={mockRoom} />);

			expect(screen.getByText("Master Bedroom")).toBeInTheDocument();
			expect(screen.getByText(/1[,.]500[,.]000/)).toBeInTheDocument();
		});

		it("displays room without rent", () => {
			const roomWithoutRent = { ...mockRoom, monthlyRent: null };
			renderWithProviders(<RoomItem room={roomWithoutRent} />);

			expect(screen.getByText("Master Bedroom")).toBeInTheDocument();
			expect(screen.queryByText(/1[,.]500[,.]000/)).not.toBeInTheDocument();
		});

		describe("Latest payment dot", () => {
			it("renders green dot for latest paid payment", () => {
				useRentPaymentsStore.setState({
					rentPayments: [
						{
							id: "p1",
							roomId: "1",
							period: "2026-01",
							amount: 1000,
							status: "paid",
						},
					],
				});

				renderWithProviders(<RoomItem room={mockRoom} />);

				expect(
					screen.getByText(/latest payment status:\s*paid/i),
				).toBeInTheDocument();
			});

			it("renders amber dot for latest pending payment", () => {
				useRentPaymentsStore.setState({
					rentPayments: [
						{
							id: "p2",
							roomId: "1",
							period: "2026-02",
							amount: 1000,
							status: "pending",
						},
					],
				});

				renderWithProviders(<RoomItem room={mockRoom} />);

				expect(
					screen.getByText(/latest payment status:\s*pending/i),
				).toBeInTheDocument();
			});

			it("renders no dot when no payments", () => {
				useRentPaymentsStore.setState({ rentPayments: [] });
				renderWithProviders(<RoomItem room={mockRoom} />);
				expect(
					screen.queryByText(/latest payment status:/i),
				).not.toBeInTheDocument();
			});
		});
	});

	describe("Interactions", () => {
		it("calls callbacks when action buttons clicked", async () => {
			const user = userEvent.setup();
			const onEdit = vi.fn();
			const onDelete = vi.fn();
			renderWithProviders(
				<RoomItem room={mockRoom} onEdit={onEdit} onDelete={onDelete} />,
			);

			await user.click(screen.getByRole("button", { name: /edit/i }));
			expect(onEdit).toHaveBeenCalledWith(mockRoom);

			await user.click(screen.getByRole("button", { name: /delete/i }));
			expect(onDelete).toHaveBeenCalledWith(mockRoom);
		});
	});
});
