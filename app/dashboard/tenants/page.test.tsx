import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useTenantsStore } from "@/components/dashboard/tenants/store";
import { renderWithProviders } from "@/test/render";
import TenantsPage from "./page";

const realFetchTenants = useTenantsStore.getState().fetchTenants;

describe("TenantsPage", () => {
	beforeEach(() => {
		useTenantsStore.getState().clearStore();
		useTenantsStore.setState({ fetchTenants: realFetchTenants });
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

		const { container } = renderWithProviders(<TenantsPage />);

		expect(
			container.querySelectorAll(".animate-shimmer").length,
		).toBeGreaterThan(0);
	});
});
