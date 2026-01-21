import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { usePropertiesStore } from "@/components/dashboard/properties";
import { renderWithProviders } from "@/test/render";
import PropertiesPage from "./page";

describe("PropertiesPage", () => {
	beforeEach(() => {
		usePropertiesStore.setState({ properties: [] });
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
				{ id: "prop-1", name: "Sunset Villa" },
				{ id: "prop-2", name: "Ocean View" },
			],
		});

		renderWithProviders(<PropertiesPage />);

		expect(
			screen.getByRole("heading", { name: /your properties/i }),
		).toBeInTheDocument();
		expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
		expect(screen.getByText("Ocean View")).toBeInTheDocument();
	});
});
