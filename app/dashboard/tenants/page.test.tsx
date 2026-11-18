import { screen } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import TenantsPage from "./page";

vi.mock("next/navigation", () => ({
	useSearchParams: vi.fn(),
}));

const setSearchParams = (value: string) => {
	vi.mocked(useSearchParams).mockReturnValue(
		new URLSearchParams(value) as unknown as ReturnType<typeof useSearchParams>,
	);
};

describe("TenantsPage", () => {
	beforeEach(() => {
		setSearchParams("");
	});

	it("shows the coming soon banner without the feature flag", () => {
		renderWithProviders(<TenantsPage />);

		expect(screen.getByText("Coming Soon")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /work in progress/i }),
		).toBeInTheDocument();
	});

	it("shows the enabled banner with ?feature=tenant", () => {
		setSearchParams("?feature=tenant");

		renderWithProviders(<TenantsPage />);

		expect(screen.getByText("Feature Enabled")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /tenant feature enabled/i }),
		).toBeInTheDocument();
	});
});
