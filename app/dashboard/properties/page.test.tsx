import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "@/components/dashboard/properties";
import { renderWithProviders } from "@/test/render";
import PropertiesPage from "./page";

describe("PropertiesPage", () => {
	beforeEach(() => {
		usePropertiesStore.setState({ properties: [], isLoading: false });
		useAuthStore.setState({ user: null });
		vi.clearAllMocks();
	});

	it("displays loading state while fetching", () => {
		usePropertiesStore.setState({ isLoading: true });

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
			isLoading: false,
		});

		renderWithProviders(<PropertiesPage />);

		expect(
			screen.getByRole("heading", { name: /your properties/i }),
		).toBeInTheDocument();
		expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
		expect(screen.getByText("Ocean View")).toBeInTheDocument();
	});
});
