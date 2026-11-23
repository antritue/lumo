import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { useTenantsStore } from "@/components/dashboard/tenants/store";
import { renderWithProviders } from "@/test/render";
import TenantsPage from "./page";

const realFetchTenants = useTenantsStore.getState().fetchTenants;
const realFetchProperties = usePropertiesStore.getState().fetchProperties;
const realFetchAllRooms = useRoomsStore.getState().fetchAllRooms;

describe("TenantsPage", () => {
	beforeEach(() => {
		useTenantsStore.getState().clearStore();
		usePropertiesStore.getState().clearStore();
		useRoomsStore.getState().clearStore();
		useTenantsStore.setState({ fetchTenants: realFetchTenants });
		usePropertiesStore.setState({ fetchProperties: realFetchProperties });
		useRoomsStore.setState({ fetchAllRooms: realFetchAllRooms });
		useAuthStore.setState({ user: null, loading: false });
	});

	it("shows the tenants page header and empty state", () => {
		renderWithProviders(<TenantsPage />);

		expect(
			screen.getByRole("heading", { name: "Tenants" }),
		).toBeInTheDocument();
		expect(screen.getByText("No tenants yet")).toBeInTheDocument();
	});

	it("shows the shared error state when fetching fails", () => {
		useTenantsStore.setState({ isTenantsFetchFailed: true });

		renderWithProviders(<TenantsPage />);

		expect(
			screen.getByRole("button", { name: "Try again" }),
		).toBeInTheDocument();
	});

	it("shows skeleton rows while loading", () => {
		useAuthStore.setState({
			user: { id: "user-1" } as never,
			loading: false,
		});
		useTenantsStore.setState({
			isTenantsLoading: true,
			hasTenantsFetched: false,
			fetchTenants: async () => {},
		});
		usePropertiesStore.setState({ fetchProperties: async () => {} });
		useRoomsStore.setState({ fetchAllRooms: async () => {} });

		const { container } = renderWithProviders(<TenantsPage />);

		expect(
			container.querySelectorAll(".animate-shimmer").length,
		).toBeGreaterThan(0);
	});
});
