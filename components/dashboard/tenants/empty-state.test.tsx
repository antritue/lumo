import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { renderWithProviders } from "@/test/render";
import { TenantEmptyState } from "./empty-state";
import { useTenantsStore } from "./store";

describe("TenantEmptyState", () => {
	beforeEach(() => {
		useTenantsStore.setState({ tenants: [] });
		useRoomsStore.setState({ rooms: [] });
		usePropertiesStore.setState({ properties: [] });
	});

	it("renders the empty message and add button", () => {
		renderWithProviders(<TenantEmptyState />);

		expect(screen.getByText("No tenants yet")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Add tenant" }),
		).toBeInTheDocument();
	});

	it("opens the add dialog when add is clicked", async () => {
		const user = userEvent.setup();

		renderWithProviders(<TenantEmptyState />);

		await user.click(screen.getByRole("button", { name: "Add tenant" }));

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Add tenant" }),
		).toBeInTheDocument();
	});
});
