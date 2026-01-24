import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { AppShell } from "./app-shell";

// Mock child components to simplify shell testing
vi.mock("./header", () => ({
	AppHeader: () => <header data-testid="app-header">Header</header>,
}));
vi.mock("./sidebar", () => ({
	AppSidebar: () => <aside data-testid="app-sidebar">Sidebar</aside>,
}));
vi.mock("./mobile-nav", () => ({
	MobileNav: () => <nav data-testid="mobile-nav">MobileNav</nav>,
}));

describe("AppShell", () => {
	it("renders header, sidebar, mobile nav and children", () => {
		renderWithProviders(
			<AppShell>
				<div data-testid="child-content">Content</div>
			</AppShell>,
		);

		expect(screen.getByTestId("app-header")).toBeInTheDocument();
		expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
		expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();
		expect(screen.getByTestId("child-content")).toBeInTheDocument();
	});
});
