import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useServicesStore } from "@/components/dashboard/services/store";
import { renderWithProviders } from "@/test/render";
import ServicesPage from "./page";

describe("ServicesPage", () => {
	beforeEach(() => {
		useServicesStore.setState({
			services: [],
			isServicesLoading: false,
			hasServicesFetched: false,
			isServicesFetchFailed: false,
		});
		useAuthStore.setState({ user: null, loading: true });
		vi.clearAllMocks();
	});

	it("displays empty state when user is not authenticated", () => {
		useAuthStore.setState({ user: null, loading: false });
		useServicesStore.setState({
			services: [],
			hasServicesFetched: true,
		});

		renderWithProviders(<ServicesPage />);

		expect(
			screen.getByRole("heading", { name: /no services yet/i }),
		).toBeInTheDocument();
	});

	it("displays loading state while fetching", () => {
		useServicesStore.setState({
			isServicesLoading: true,
			hasServicesFetched: true,
		});

		const { container } = renderWithProviders(<ServicesPage />);

		const skeletonElements = container.querySelectorAll(".animate-shimmer");
		expect(skeletonElements.length).toBeGreaterThan(0);

		expect(
			screen.getByRole("heading", { name: /your services/i }),
		).toBeInTheDocument();
	});

	it("displays empty state when no services exist", () => {
		useServicesStore.setState({ hasServicesFetched: true });
		renderWithProviders(<ServicesPage />);

		expect(
			screen.getByRole("heading", { name: /no services yet/i }),
		).toBeInTheDocument();
	});

	it("displays service list when services exist", () => {
		useServicesStore.setState({
			services: [
				{
					id: "svc-1",
					userId: "user-1",
					name: "Electricity",
					unitLabel: "kWh",
					pricingType: "variable",
					flatAmount: null,
					unitPrice: 0.15,
				},
				{
					id: "svc-2",
					userId: "user-1",
					name: "Water",
					unitLabel: "m³",
					pricingType: "variable",
					flatAmount: null,
					unitPrice: null,
				},
			],
			isServicesLoading: false,
			hasServicesFetched: true,
		});

		renderWithProviders(<ServicesPage />);

		expect(
			screen.getByRole("heading", { name: /your services/i }),
		).toBeInTheDocument();
		expect(screen.getByText("Electricity")).toBeInTheDocument();
		expect(screen.getByText("Water")).toBeInTheDocument();
	});

	it("displays error state when isServicesFetchFailed is true", () => {
		useAuthStore.setState({ user: null, loading: false });
		useServicesStore.setState({
			isServicesFetchFailed: true,
			isServicesLoading: false,
			hasServicesFetched: true,
		});

		renderWithProviders(<ServicesPage />);

		expect(
			screen.getByRole("heading", { name: /failed to load data/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /try again/i }),
		).toBeInTheDocument();
	});
});
