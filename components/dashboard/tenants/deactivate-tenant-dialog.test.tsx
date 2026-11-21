import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { DeactivateTenantDialog } from "./deactivate-tenant-dialog";
import type { Tenant } from "./types";

const tenant: Tenant = {
	id: "tenant-1",
	userId: "",
	roomId: "room-1",
	fullName: "Anh Nguyen",
	phone: "0901 234 567",
	email: null,
	notes: null,
};

describe("DeactivateTenantDialog", () => {
	it("explains that the contact record is kept", () => {
		renderWithProviders(
			<DeactivateTenantDialog
				tenant={tenant}
				open
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
			/>,
		);

		expect(
			screen.getByRole("heading", { name: /Move Anh Nguyen to Inactive\?/ }),
		).toBeInTheDocument();
		expect(screen.getByText(/Their contact record stays/)).toBeInTheDocument();
	});

	it("confirms deactivation and closes", async () => {
		const user = userEvent.setup();
		const onConfirm = vi.fn().mockResolvedValue(undefined);
		const onOpenChange = vi.fn();

		renderWithProviders(
			<DeactivateTenantDialog
				tenant={tenant}
				open
				onOpenChange={onOpenChange}
				onConfirm={onConfirm}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Deactivate" }));

		expect(onConfirm).toHaveBeenCalledWith("tenant-1");
		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
	});
});
