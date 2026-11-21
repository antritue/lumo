import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { TenantItem } from "./tenant-item";
import type { Tenant } from "./types";

const room = {
	id: "room-1",
	propertyId: "property-1",
	name: "Room 101",
	monthlyRent: 12_000_000,
	notes: null,
};

const mockTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
	id: "tenant-1",
	userId: "",
	roomId: "room-1",
	fullName: "Anh Nguyen",
	phone: "0901 234 567",
	email: "anh@example.com",
	notes: null,
	...overrides,
});

const renderRow = (
	tenant: Tenant,
	props: Partial<Parameters<typeof TenantItem>[0]> = {},
) => {
	const handlers = {
		onEdit: vi.fn(),
		onDeactivate: vi.fn(),
		onDelete: vi.fn(),
	};

	renderWithProviders(
		<TenantItem
			tenant={tenant}
			room={tenant.roomId ? room : undefined}
			propertyName="Vinhomes Central Park"
			{...handlers}
			{...props}
		/>,
	);

	return handlers;
};

describe("TenantItem", () => {
	describe("Display", () => {
		it("shows a phone-first contact column", () => {
			renderRow(mockTenant());

			expect(screen.getByText("Anh Nguyen")).toBeInTheDocument();
			expect(screen.getByText("0901 234 567")).toBeInTheDocument();
			expect(screen.getByText("anh@example.com")).toBeInTheDocument();
			expect(screen.getByText("Room 101")).toBeInTheDocument();
			expect(screen.getByText("Vinhomes Central Park")).toBeInTheDocument();
		});

		it("shows No email when only a phone is present", () => {
			renderRow(mockTenant({ email: null }));

			expect(screen.getByText("No email")).toBeInTheDocument();
		});

		it("shows No contact method when both are missing", () => {
			renderRow(mockTenant({ phone: null, email: null }));

			expect(screen.getByText("No contact method")).toBeInTheDocument();
		});

		it("shows an email alone without a No email hint", () => {
			renderRow(mockTenant({ phone: null }));

			expect(screen.getByText("anh@example.com")).toBeInTheDocument();
			expect(screen.queryByText("No email")).not.toBeInTheDocument();
		});

		it("shows Not assigned for an inactive tenant", () => {
			renderRow(mockTenant({ roomId: null }));

			expect(screen.getAllByText("Not assigned").length).toBeGreaterThan(0);
			expect(screen.getByText("Inactive")).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("opens the actions menu and triggers edit and delete", async () => {
			const user = userEvent.setup();
			const handlers = renderRow(mockTenant());

			await user.click(
				screen.getByRole("button", { name: "Actions for Anh Nguyen" }),
			);
			await user.click(screen.getByRole("button", { name: "Edit" }));
			expect(handlers.onEdit).toHaveBeenCalledWith(
				expect.objectContaining({ id: "tenant-1" }),
			);

			await user.click(screen.getByRole("button", { name: "Delete" }));
			expect(handlers.onDelete).toHaveBeenCalledWith(
				expect.objectContaining({ id: "tenant-1" }),
			);
		});

		it("deactivates an active tenant", async () => {
			const user = userEvent.setup();
			const handlers = renderRow(mockTenant());

			await user.click(
				screen.getByRole("button", { name: "Actions for Anh Nguyen" }),
			);
			await user.click(screen.getByRole("button", { name: "Deactivate" }));

			expect(handlers.onDeactivate).toHaveBeenCalledWith(
				expect.objectContaining({ id: "tenant-1" }),
			);
		});

		it("hides Deactivate for an inactive tenant", async () => {
			const user = userEvent.setup();
			renderRow(mockTenant({ roomId: null }));

			await user.click(
				screen.getByRole("button", { name: "Actions for Anh Nguyen" }),
			);

			expect(
				screen.queryByRole("button", { name: "Deactivate" }),
			).not.toBeInTheDocument();
		});
	});
});
