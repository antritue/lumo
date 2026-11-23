import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeleteTenantDialog } from "./delete-tenant-dialog";
import type { Tenant } from "./types";

const tenant: Tenant = {
	id: "tenant-1",
	userId: "",
	roomId: null,
	fullName: "Anh Nguyen",
	phone: "0901 234 567",
	email: null,
	notes: null,
};

const renderDialog = (dialogTenant: Tenant) =>
	renderWithProviders(
		<DeleteTenantDialog
			tenant={dialogTenant}
			open
			onOpenChange={vi.fn()}
			onConfirm={vi.fn()}
		/>,
	);

describe("DeleteTenantDialog", () => {
	it("highlights the inactive tenant name and omits the room note", () => {
		renderDialog(tenant);

		expect(
			screen.getByRole("heading", { name: "Delete tenant?" }),
		).toBeInTheDocument();
		expect(
			screen.getByText("Anh Nguyen", { selector: "strong" }),
		).toBeInTheDocument();
		expect(screen.getByText(/This cannot be undone/)).toBeInTheDocument();
		expect(
			screen.queryByText(/The room becomes available/),
		).not.toBeInTheDocument();
	});

	it("explains that the room becomes available for an active tenant", () => {
		renderDialog({ ...tenant, roomId: "room-1" });

		expect(
			screen.getByText(
				/The room becomes available and payment records stay with the room/,
			),
		).toBeInTheDocument();
	});

	it("confirms the delete and closes", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn().mockResolvedValue(undefined);
		const onOpenChange = vi.fn();

		renderWithProviders(
			<DeleteTenantDialog
				tenant={tenant}
				open
				onOpenChange={onOpenChange}
				onConfirm={onConfirm}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Delete tenant" }));

		expect(onConfirm).toHaveBeenCalledWith("tenant-1");
		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
	});

	it("shows an error when the delete fails", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn().mockRejectedValue(new Error("failed"));

		renderWithProviders(
			<DeleteTenantDialog
				tenant={tenant}
				open
				onOpenChange={vi.fn()}
				onConfirm={onConfirm}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Delete tenant" }));

		await waitFor(() =>
			expect(
				screen.getByRole("heading", { name: "Failed to delete tenant" }),
			).toBeInTheDocument(),
		);
	});
});
