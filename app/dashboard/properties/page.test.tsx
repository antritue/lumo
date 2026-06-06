import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { renderWithProviders } from "@/test/render";
import PropertiesPage from "./page";

describe("PropertiesPage", () => {
	beforeEach(() => {
		usePropertiesStore.setState({
			properties: [],
			isPropertiesLoading: false,
			hasPropertiesFetched: false,
			propertiesFetchFailed: false,
		});
		useAuthStore.setState({ user: null, loading: true });
		vi.clearAllMocks();
	});

	it("displays empty state when user is not authenticated", () => {
		useAuthStore.setState({ user: null, loading: false });

		renderWithProviders(<PropertiesPage />);

		expect(
			screen.getByRole("heading", { name: /no properties yet/i }),
		).toBeInTheDocument();
	});

	it("displays loading state while fetching", () => {
		usePropertiesStore.setState({ isPropertiesLoading: true });

		const { container } = renderWithProviders(<PropertiesPage />);

		// Check that skeleton loading state is rendered
		const skeletonElements = container.querySelectorAll(".animate-shimmer");
		expect(skeletonElements.length).toBeGreaterThan(0);

		// Header should still be visible during loading
		expect(
			screen.getByRole("heading", { name: /your properties/i }),
		).toBeInTheDocument();
	});

	it("displays empty state when no properties exist", () => {
		usePropertiesStore.setState({ hasPropertiesFetched: true });
		renderWithProviders(<PropertiesPage />);

		expect(
			screen.getByRole("heading", { name: /no properties yet/i }),
		).toBeInTheDocument();
	});

	it("displays property list when properties exist", () => {
		usePropertiesStore.setState({
			properties: [
				{
					id: "prop-1",
					name: "Sunset Villa",
					userId: "user-1",
				},
				{
					id: "prop-2",
					name: "Ocean View",
					userId: "user-1",
				},
			],
			isPropertiesLoading: false,
			hasPropertiesFetched: true,
		});

		renderWithProviders(<PropertiesPage />);

		expect(
			screen.getByRole("heading", { name: /your properties/i }),
		).toBeInTheDocument();
		expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
		expect(screen.getByText("Ocean View")).toBeInTheDocument();
	});

	it("displays error state when propertiesFetchFailed is true", () => {
		useAuthStore.setState({ user: null, loading: false });
		usePropertiesStore.setState({
			propertiesFetchFailed: true,
			isPropertiesLoading: false,
			hasPropertiesFetched: false,
		});

		renderWithProviders(<PropertiesPage />);

		expect(
			screen.getByRole("heading", { name: /failed to load data/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /try again/i }),
		).toBeInTheDocument();
	});

	it("calls fetchProperties when retry is clicked", async () => {
		const user = userEvent.setup();
		const fetchPropertiesSpy = vi.fn();

		useAuthStore.setState({ user: null, loading: false });
		usePropertiesStore.setState({
			propertiesFetchFailed: true,
			isPropertiesLoading: false,
			hasPropertiesFetched: false,
			fetchProperties: fetchPropertiesSpy,
		});

		renderWithProviders(<PropertiesPage />);

		const retryButton = screen.getByRole("button", { name: /try again/i });
		await user.click(retryButton);

		expect(fetchPropertiesSpy).toHaveBeenCalledTimes(1);
	});
});
