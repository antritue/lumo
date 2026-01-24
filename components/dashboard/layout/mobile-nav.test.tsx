import { screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { MobileNav } from "./mobile-nav";

// Mock next/navigation
vi.mock("next/navigation", () => ({
	usePathname: vi.fn(),
}));

describe("MobileNav", () => {
	it("renders navigation items", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard/properties");
		renderWithProviders(<MobileNav />);

		expect(screen.getByText(/properties/i)).toBeInTheDocument();
	});

	it("highlights active item", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard/properties");
		renderWithProviders(<MobileNav />);

		const activeLink = screen.getByRole("link", { name: /properties/i });
		expect(activeLink).toHaveClass("text-primary");
	});

	it("does not highlight inactive items", () => {
		vi.mocked(usePathname).mockReturnValue("/dashboard/other");
		renderWithProviders(<MobileNav />);

		const link = screen.getByRole("link", { name: /properties/i });
		expect(link).not.toHaveClass("text-primary");
		expect(link).toHaveClass("text-muted-foreground");
	});
});
