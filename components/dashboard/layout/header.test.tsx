import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { AppHeader } from "./header";

// Mock next/navigation
vi.mock("next/navigation", () => ({
	usePathname: vi.fn(() => "/dashboard"),
	useRouter: vi.fn(() => ({
		push: vi.fn(),
		replace: vi.fn(),
		refresh: vi.fn(),
	})),
}));

describe("AppHeader", () => {
	it("renders logo and sign in button", () => {
		renderWithProviders(<AppHeader />);

		expect(screen.getByRole("link", { name: /lumo/i })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /sign in/i }),
		).toBeInTheDocument();
	});

	it("renders mobile menu button", () => {
		renderWithProviders(<AppHeader />);

		// The menu button is hidden on desktop but exists in DOM
		expect(
			screen.getByRole("button", { name: /open menu/i }),
		).toBeInTheDocument();
	});
});
