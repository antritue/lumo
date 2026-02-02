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

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock("@/components/dashboard/auth", () => ({
	useAuth: () => mockUseAuth(),
}));

describe("AppHeader", () => {
	it("renders logo and sign in button when signed out", () => {
		mockUseAuth.mockReturnValue({
			user: null,
			loading: false,
			signInWithGoogle: vi.fn(),
			signOut: vi.fn(),
		});

		renderWithProviders(<AppHeader />);

		expect(screen.getByRole("link", { name: /lumo/i })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /sign in/i }),
		).toBeInTheDocument();
	});

	it("renders sign out button when signed in", () => {
		mockUseAuth.mockReturnValue({
			user: { email: "test@example.com" },
			loading: false,
			signInWithGoogle: vi.fn(),
			signOut: vi.fn(),
		});

		renderWithProviders(<AppHeader />);

		expect(
			screen.getByRole("button", { name: /sign out/i }),
		).toBeInTheDocument();
	});

	it("renders mobile menu button", () => {
		mockUseAuth.mockReturnValue({
			user: null,
			loading: false,
			signInWithGoogle: vi.fn(),
			signOut: vi.fn(),
		});

		renderWithProviders(<AppHeader />);

		// The menu button is hidden on desktop but exists in DOM
		expect(
			screen.getByRole("button", { name: /open menu/i }),
		).toBeInTheDocument();
	});
});
