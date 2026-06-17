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

	describe("when fetching properties failed", () => {
		it("shows error message and retry button", () => {
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

		it("retries fetchProperties on click", async () => {
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

			await user.click(screen.getByRole("button", { name: /try again/i }));

			expect(fetchPropertiesSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("while properties are still loading", () => {
		it("shows skeleton", () => {
			usePropertiesStore.setState({ isPropertiesLoading: true });

			const { container } = renderWithProviders(<PropertiesPage />);

			expect(
				container.querySelectorAll(".animate-shimmer").length,
			).toBeGreaterThan(0);
		});
	});

	describe("when there are no properties", () => {
		it("shows empty state", () => {
			usePropertiesStore.setState({ hasPropertiesFetched: true });

			renderWithProviders(<PropertiesPage />);

			expect(
				screen.getByRole("heading", { name: /no properties yet/i }),
			).toBeInTheDocument();
		});
	});

	describe("when properties exist", () => {
		it("renders all property names", () => {
			usePropertiesStore.setState({
				properties: [
					{ id: "prop-1", name: "Sunset Villa", userId: "user-1" },
					{ id: "prop-2", name: "Ocean View", userId: "user-1" },
				],
				isPropertiesLoading: false,
				hasPropertiesFetched: true,
			});

			renderWithProviders(<PropertiesPage />);

			expect(screen.getAllByText("Sunset Villa").length).toBeGreaterThanOrEqual(
				1,
			);
			expect(screen.getAllByText("Ocean View").length).toBeGreaterThanOrEqual(
				1,
			);
		});
	});
});
