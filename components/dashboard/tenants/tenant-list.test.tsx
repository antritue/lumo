import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { renderWithProviders } from "@/test/render";
import { useTenantsStore } from "./store";
import { TenantList } from "./tenant-list";
import type { Tenant } from "./types";

const tenants: Tenant[] = [
	{
		id: "tenant-1",
		userId: "",
		roomId: "room-2",
		fullName: "Anh Nguyen",
		phone: "0901 234 567",
		email: "anh@example.com",
		notes: null,
	},
	{
		id: "tenant-2",
		userId: "",
		roomId: "room-10",
		fullName: "Binh Le",
		phone: "0912 345 678",
		email: null,
		notes: null,
	},
	{
		id: "tenant-3",
		userId: "",
		roomId: null,
		fullName: "Minh Ngo",
		phone: null,
		email: "minh@example.com",
		notes: null,
	},
];

const seedStores = () => {
	useTenantsStore.setState({ tenants });
	usePropertiesStore.setState({
		properties: [
			{ id: "property-1", userId: "", name: "Vinhomes Central Park" },
			{ id: "property-2", userId: "", name: "Masteri Thao Dien" },
		],
		hasPropertiesFetched: true,
	});
	useRoomsStore.setState({
		rooms: [
			{
				id: "room-2",
				propertyId: "property-1",
				name: "Room 2",
				monthlyRent: null,
				notes: null,
			},
			{
				id: "room-10",
				propertyId: "property-2",
				name: "Room 10",
				monthlyRent: null,
				notes: null,
			},
		],
	});
};

const filterGroup = () => screen.getByRole("group", { name: "Filter tenants" });

beforeEach(() => {
	useTenantsStore.getState().clearStore();
	usePropertiesStore.setState({ properties: [] });
	useRoomsStore.setState({ rooms: [] });
	vi.restoreAllMocks();
});

describe("TenantList", () => {
	it("shows tenant counts and the flat list", () => {
		seedStores();
		renderWithProviders(<TenantList />);

		expect(
			within(filterGroup()).getByRole("button", { name: /^Active\s*2$/ }),
		).toBeInTheDocument();
		expect(
			within(filterGroup()).getByRole("button", { name: /^Inactive\s*1$/ }),
		).toBeInTheDocument();
		expect(
			within(filterGroup()).getByRole("button", { name: /^All\s*3$/ }),
		).toBeInTheDocument();

		// The Active tab is the default view, so the moved-out tenant is hidden.
		expect(screen.getByText("Anh Nguyen")).toBeInTheDocument();
		expect(screen.getByText("Binh Le")).toBeInTheDocument();
		expect(screen.queryByText("Minh Ngo")).not.toBeInTheDocument();
	});

	it("defaults to the active tab", async () => {
		const user = userEvent.setup();
		seedStores();
		renderWithProviders(<TenantList />);

		expect(
			within(filterGroup()).getByRole("button", { name: /^Active/ }),
		).toHaveAttribute("aria-pressed", "true");
		expect(screen.queryByText("Minh Ngo")).not.toBeInTheDocument();

		await user.click(
			within(filterGroup()).getByRole("button", { name: /^All/ }),
		);

		expect(screen.getByText("Minh Ngo")).toBeInTheDocument();
	});

	it("paginates long lists and resets to page one on search", async () => {
		const user = userEvent.setup();
		const manyTenants: Tenant[] = Array.from({ length: 12 }, (_, index) => ({
			id: `tenant-${index + 1}`,
			userId: "",
			roomId: null,
			fullName: `Tenant ${String.fromCharCode(65 + index)}`,
			phone: null,
			email: null,
			notes: null,
		}));
		useTenantsStore.setState({ tenants: manyTenants });
		renderWithProviders(<TenantList />);

		// All seeded tenants moved out, so the default Active tab is empty.
		expect(screen.getByText("No active tenants")).toBeInTheDocument();

		await user.click(
			within(filterGroup()).getByRole("button", { name: /^All/ }),
		);

		expect(screen.getByText("Tenant A")).toBeInTheDocument();
		expect(screen.getByText("Tenant J")).toBeInTheDocument();
		expect(screen.queryByText("Tenant K")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Go to page 2" }));

		expect(screen.queryByText("Tenant A")).not.toBeInTheDocument();
		expect(screen.getByText("Tenant K")).toBeInTheDocument();
		expect(screen.getByText("Tenant L")).toBeInTheDocument();

		await user.type(
			screen.getByLabelText("Search name, phone, room"),
			"Tenant B",
		);

		expect(screen.getByText("Tenant B")).toBeInTheDocument();

		await user.click(
			screen.getAllByRole("button", { name: "Clear search" })[0],
		);

		expect(screen.getByText("Tenant A")).toBeInTheDocument();
	});

	it("sorts active tenants by property then room", () => {
		seedStores();
		renderWithProviders(<TenantList />);

		const rows = screen.getAllByRole("listitem");
		// Masteri Thao Dien sorts before Vinhomes Central Park (A–Z).
		expect(rows[0]).toHaveTextContent("Binh Le");
		expect(rows[0]).toHaveTextContent("Room 10");
		expect(rows[1]).toHaveTextContent("Anh Nguyen");
		expect(rows[1]).toHaveTextContent("Room 2");
		expect(rows).toHaveLength(2);
	});

	it("filters by tab", async () => {
		const user = userEvent.setup();
		seedStores();
		renderWithProviders(<TenantList />);

		await user.click(
			within(filterGroup()).getByRole("button", { name: /^Inactive/ }),
		);

		expect(screen.queryByText("Anh Nguyen")).not.toBeInTheDocument();
		expect(screen.getByText("Minh Ngo")).toBeInTheDocument();
	});

	it("searches by property and room name", async () => {
		const user = userEvent.setup();
		seedStores();
		renderWithProviders(<TenantList />);

		await user.type(
			screen.getByLabelText("Search name, phone, room"),
			"masteri",
		);

		expect(screen.getByText("Binh Le")).toBeInTheDocument();
		expect(screen.queryByText("Anh Nguyen")).not.toBeInTheDocument();
	});

	it("shows a no-results state and clears the search", async () => {
		const user = userEvent.setup();
		seedStores();
		renderWithProviders(<TenantList />);

		await user.type(screen.getByLabelText("Search name, phone, room"), "zzz");

		expect(
			screen.getByText("No tenants match your search"),
		).toBeInTheDocument();

		await user.click(
			screen.getAllByRole("button", { name: "Clear search" })[0],
		);

		expect(screen.getByText("Anh Nguyen")).toBeInTheDocument();
	});

	it("points an empty Active tab to the inactive list", async () => {
		const user = userEvent.setup();
		seedStores();
		useTenantsStore.setState({
			tenants: [{ ...tenants[2] }],
		});
		renderWithProviders(<TenantList />);

		await user.click(
			within(filterGroup()).getByRole("button", { name: /^Active/ }),
		);

		expect(screen.getByText("No active tenants")).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: "View inactive tenants" }),
		);

		expect(screen.getByText("Minh Ngo")).toBeInTheDocument();
	});

	it("opens the add dialog from the toolbar", async () => {
		const user = userEvent.setup();
		seedStores();
		renderWithProviders(<TenantList />);

		await user.click(screen.getByRole("button", { name: "Add tenant" }));

		await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
		expect(
			within(screen.getByRole("dialog")).getByRole("heading", {
				name: "Add tenant",
			}),
		).toBeInTheDocument();
	});

	it("opens the edit dialog with the selected tenant and its room available", async () => {
		const user = userEvent.setup();
		seedStores();
		renderWithProviders(<TenantList />);

		await user.click(
			screen.getByRole("button", { name: "Actions for Anh Nguyen" }),
		);
		await user.click(screen.getByRole("button", { name: "Edit" }));

		const dialog = await screen.findByRole("dialog");
		expect(
			within(dialog).getByRole("heading", { name: "Edit tenant" }),
		).toBeInTheDocument();
		expect(within(dialog).getByLabelText("Full name")).toHaveValue(
			"Anh Nguyen",
		);
		expect(
			within(dialog).getByRole("option", { name: "Room 2" }),
		).toBeInTheDocument();
		expect(
			within(dialog).queryByRole("option", { name: "Room 10" }),
		).not.toBeInTheDocument();
	});
});
