import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Property } from "@/components/dashboard/properties/types";
import type { Room } from "@/components/dashboard/rooms/types";
import { renderWithProviders } from "@/test/render";
import { RoomOccupiedError } from "./store";
import type { Tenant } from "./types";
import { UpsertTenantDialog } from "./upsert-tenant-dialog";

const properties: Property[] = [
	{ id: "property-1", userId: "", name: "Vinhomes Central Park" },
	{ id: "property-2", userId: "", name: "Masteri Thao Dien" },
];

const rooms: Room[] = [
	{
		id: "room-1",
		propertyId: "property-1",
		name: "Room 101",
		monthlyRent: null,
		notes: null,
	},
	{
		id: "room-2",
		propertyId: "property-1",
		name: "Room 102",
		monthlyRent: null,
		notes: null,
	},
	{
		id: "room-3",
		propertyId: "property-2",
		name: "Room 201",
		monthlyRent: null,
		notes: null,
	},
];

const tenant: Tenant = {
	id: "tenant-1",
	userId: "",
	roomId: "room-1",
	fullName: "Anh Nguyen",
	phone: "0901 234 567",
	email: "anh@example.com",
	notes: "Quiet tenant",
};

const renderDialog = (
	props: Partial<Parameters<typeof UpsertTenantDialog>[0]> = {},
) => {
	const onSave = vi.fn().mockResolvedValue(undefined);
	const onOpenChange = vi.fn();

	renderWithProviders(
		<UpsertTenantDialog
			mode="add"
			open
			onOpenChange={onOpenChange}
			onSave={onSave}
			rooms={rooms}
			properties={properties}
			occupiedRoomIds={new Set(["room-1"])}
			{...props}
		/>,
	);

	return { onSave, onOpenChange };
};

describe("UpsertTenantDialog", () => {
	describe("Display", () => {
		it("renders the add form with grouped free rooms", () => {
			renderDialog();

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: "Add tenant" }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("option", {
					name: "No room — keep as inactive",
				}),
			).toBeInTheDocument();
			expect(
				within(dialog).queryByRole("option", { name: "Room 101" }),
			).not.toBeInTheDocument();
			expect(
				within(dialog).getByRole("option", { name: "Room 102" }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByRole("option", { name: "Room 201" }),
			).toBeInTheDocument();
			expect(
				within(dialog).getByText(
					"Leave without a room to save this tenant as inactive",
				),
			).toBeInTheDocument();
		});

		it("prefills the edit form and keeps the current room selectable", () => {
			renderDialog({ mode: "edit", tenant });

			const dialog = screen.getByRole("dialog");
			expect(
				within(dialog).getByRole("heading", { name: "Edit tenant" }),
			).toBeInTheDocument();
			expect(within(dialog).getByLabelText("Full name")).toHaveValue(
				"Anh Nguyen",
			);
			expect(
				within(dialog).getByRole("option", { name: "Room 101" }),
			).toBeInTheDocument();
			expect(within(dialog).getByLabelText(/^Notes/)).toHaveValue(
				"Quiet tenant",
			);
		});
	});

	describe("Interactions", () => {
		it("disables save until a name is entered", async () => {
			const user = userEvent.setup();
			renderDialog();

			const save = screen.getByRole("button", { name: "Add tenant" });
			expect(save).toBeDisabled();

			await user.type(screen.getByLabelText("Full name"), "Binh Le");

			expect(save).toBeEnabled();
		});

		it("submits trimmed values and nulls empty optional fields", async () => {
			const user = userEvent.setup();
			const { onSave, onOpenChange } = renderDialog();

			await user.type(screen.getByLabelText("Full name"), "  Binh Le  ");
			await user.selectOptions(screen.getByLabelText(/Room/), "room-2");
			await user.type(screen.getByLabelText(/Phone/), " 0912 345 678 ");
			await user.type(screen.getByLabelText(/Email/), "binh@example.com");

			const form = screen
				.getByRole("button", { name: "Add tenant" })
				.closest("form");
			fireEvent.submit(form as HTMLFormElement);

			await waitFor(() => expect(onSave).toHaveBeenCalled());
			expect(onSave).toHaveBeenCalledWith({
				fullName: "Binh Le",
				roomId: "room-2",
				phone: "0912 345 678",
				email: "binh@example.com",
				notes: null,
			});
			await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
		});

		it("blocks an invalid email", async () => {
			const user = userEvent.setup();
			renderDialog();

			await user.type(screen.getByLabelText("Full name"), "Binh Le");
			await user.type(screen.getByLabelText(/Email/), "not-an-email");

			expect(
				screen.getByText("Enter a valid email address"),
			).toBeInTheDocument();
			expect(screen.getByRole("button", { name: "Add tenant" })).toBeDisabled();
		});

		it("shows the room occupied error and keeps the dialog open", async () => {
			const user = userEvent.setup();
			const onSave = vi.fn().mockRejectedValue(new RoomOccupiedError());
			renderDialog({ onSave });

			await user.type(screen.getByLabelText("Full name"), "Binh Le");
			const form = screen
				.getByRole("button", { name: "Add tenant" })
				.closest("form");
			fireEvent.submit(form as HTMLFormElement);

			await waitFor(() =>
				expect(
					screen.getByRole("heading", { name: "Room already taken" }),
				).toBeInTheDocument(),
			);
		});
	});
});
