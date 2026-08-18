import type { User } from "@supabase/supabase-js";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "../auth/store";
import { useBillingStore } from "../billing/store";
import type { BillingStatus } from "../billing/types";
import { SettingsBillingCard } from "./billing-card";

const assignMock = vi.fn();

Object.defineProperty(window, "location", {
	value: { assign: assignMock },
	writable: true,
});

const mockUseAuth = vi.fn();
vi.mock("../auth", () => ({
	useAuth: () => mockUseAuth(),
}));

describe("SettingsBillingCard", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.setState({ user: { id: "user-1" } as User, loading: false });
		mockUseAuth.mockReturnValue({ signInWithGoogle: vi.fn() });
		useBillingStore.setState({
			status: null,
			isStatusLoading: false,
			hasStatusFetched: false,
			statusFetchFailed: false,
			isCheckoutLoading: false,
			fetchStatus: vi.fn(),
			startCheckout: vi.fn(),
		});
	});

	describe("Fetch on mount", () => {
		it("refetches billing status when a user is present", () => {
			useAuthStore.setState({
				user: { id: "user-1" } as User,
			});
			const fetchStatus = vi.fn();
			useBillingStore.setState({ fetchStatus });

			renderWithProviders(<SettingsBillingCard />);

			expect(fetchStatus).toHaveBeenCalledTimes(1);
			expect(fetchStatus).toHaveBeenCalledWith();
		});

		it("does not fetch billing status while unauthenticated", () => {
			useAuthStore.setState({ user: null });
			const fetchStatus = vi.fn();
			useBillingStore.setState({ fetchStatus });

			renderWithProviders(<SettingsBillingCard />);

			expect(fetchStatus).not.toHaveBeenCalled();
		});
	});

	describe("Display", () => {
		it.each<{ name: string; status: BillingStatus }>([
			{
				name: "free user",
				status: { tier: null, isPaid: false, roomLimit: 5, roomCount: 3 },
			},
			{
				name: "revoked lifetime entitlement",
				status: { tier: "lifetime", isPaid: false, roomLimit: 5, roomCount: 3 },
			},
		])("shows the free plan with room usage for a $name", ({ status }) => {
			useBillingStore.setState({ status, hasStatusFetched: true });

			renderWithProviders(<SettingsBillingCard />);

			expect(screen.getByText("Free")).toBeInTheDocument();
			expect(screen.getByText("3 of 5 rooms used")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /upgrade/i }),
			).toBeInTheDocument();
		});

		it("shows the paid plan with unlimited rooms for a paid user", () => {
			useBillingStore.setState({
				status: {
					tier: "yearly",
					isPaid: true,
					roomLimit: null,
					roomCount: 10,
				},
				hasStatusFetched: true,
			});

			renderWithProviders(<SettingsBillingCard />);

			expect(screen.getByText("Yearly")).toBeInTheDocument();
			expect(screen.getByText("Unlimited rooms")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /manage subscription/i }),
			).toBeInTheDocument();
		});

		it("shows the buy-lifetime action for a monthly subscriber", () => {
			useBillingStore.setState({
				status: {
					tier: "monthly",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
			});

			renderWithProviders(<SettingsBillingCard />);

			expect(
				screen.getByRole("button", { name: /buy lifetime/i }),
			).toBeInTheDocument();
			expect(
				screen.getByText(/buy lifetime once and stop/i),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /manage subscription/i }),
			).toBeInTheDocument();
		});

		it("shows the buy-lifetime action for a yearly subscriber", () => {
			useBillingStore.setState({
				status: {
					tier: "yearly",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
			});

			renderWithProviders(<SettingsBillingCard />);

			expect(
				screen.getByRole("button", { name: /buy lifetime/i }),
			).toBeInTheDocument();
		});

		it("hides the buy-lifetime and manage-subscription actions for a lifetime user", () => {
			useBillingStore.setState({
				status: {
					tier: "lifetime",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
			});

			renderWithProviders(<SettingsBillingCard />);

			expect(
				screen.queryByRole("button", { name: /buy lifetime/i }),
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole("button", { name: /manage subscription/i }),
			).not.toBeInTheDocument();
		});

		it("disables the buy-lifetime button while checkout is loading", () => {
			useBillingStore.setState({
				status: {
					tier: "monthly",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
				isCheckoutLoading: true,
			});

			renderWithProviders(<SettingsBillingCard />);

			expect(
				screen.getByRole("button", { name: /buy lifetime/i }),
			).toBeDisabled();
		});

		it("shows a loading skeleton until billing status is fetched for a signed-in user", () => {
			useBillingStore.setState({ hasStatusFetched: false });

			const { container } = renderWithProviders(<SettingsBillingCard />);

			expect(container.querySelector(".animate-shimmer")).toBeInTheDocument();
		});

		it("shows a loading skeleton while auth is still loading", () => {
			useAuthStore.setState({ user: null, loading: true });
			useBillingStore.setState({
				status: null,
				isStatusLoading: false,
				hasStatusFetched: false,
			});

			const { container } = renderWithProviders(<SettingsBillingCard />);

			expect(container.querySelector(".animate-shimmer")).toBeInTheDocument();
		});

		it("shows a sign-in prompt and button for a signed-out user", () => {
			useAuthStore.setState({ user: null, loading: false });
			useBillingStore.setState({
				status: null,
				isStatusLoading: false,
				hasStatusFetched: false,
			});

			const { container } = renderWithProviders(<SettingsBillingCard />);

			expect(screen.getByText("Free")).toBeInTheDocument();
			expect(
				screen.getByText("Sign in to track your rooms"),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /sign in/i }),
			).toBeInTheDocument();
			expect(
				container.querySelector(".animate-shimmer"),
			).not.toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("starts Google sign-in for a signed-out user", async () => {
			const user = userEvent.setup();
			const signInWithGoogle = vi.fn().mockResolvedValue(undefined);
			useAuthStore.setState({ user: null, loading: false });
			useBillingStore.setState({
				status: null,
				hasStatusFetched: false,
			});
			mockUseAuth.mockReturnValue({ signInWithGoogle });

			renderWithProviders(<SettingsBillingCard />);

			await user.click(screen.getByRole("button", { name: /sign in/i }));

			expect(signInWithGoogle).toHaveBeenCalledOnce();
		});

		it("shows an error dialog when Google sign-in fails", async () => {
			const user = userEvent.setup();
			useAuthStore.setState({ user: null, loading: false });
			useBillingStore.setState({
				status: null,
				hasStatusFetched: false,
			});
			mockUseAuth.mockReturnValue({
				signInWithGoogle: vi.fn().mockRejectedValue(new Error("auth failed")),
			});

			renderWithProviders(<SettingsBillingCard />);

			await user.click(screen.getByRole("button", { name: /sign in/i }));

			expect(
				screen.getByRole("heading", { name: /auth failed/i }),
			).toBeInTheDocument();
		});

		it("opens the upgrade dialog for a free user", async () => {
			const user = userEvent.setup();
			useBillingStore.setState({
				status: { tier: null, isPaid: false, roomLimit: 5, roomCount: 5 },
				hasStatusFetched: true,
			});

			renderWithProviders(<SettingsBillingCard />);

			await user.click(screen.getByRole("button", { name: /upgrade/i }));

			expect(
				screen.getByRole("heading", { name: /upgrade for unlimited rooms/i }),
			).toBeInTheDocument();
		});

		it("navigates to the customer portal for a paid user", async () => {
			const user = userEvent.setup();
			const startPortal = vi
				.fn()
				.mockResolvedValue("https://sandbox.polar.sh/portal?token=x");
			useBillingStore.setState({
				status: {
					tier: "monthly",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
				startPortal,
			});

			renderWithProviders(<SettingsBillingCard />);

			await user.click(
				screen.getByRole("button", { name: /manage subscription/i }),
			);

			expect(startPortal).toHaveBeenCalledTimes(1);
			expect(assignMock).toHaveBeenCalledWith(
				"https://sandbox.polar.sh/portal?token=x",
			);
		});

		it("starts lifetime checkout for a paid subscriber", async () => {
			const user = userEvent.setup();
			const startCheckout = vi
				.fn()
				.mockResolvedValue("https://sandbox.polar.sh/checkout?x=y");
			useBillingStore.setState({
				status: {
					tier: "monthly",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
				startCheckout,
			});

			renderWithProviders(<SettingsBillingCard />);

			await user.click(screen.getByRole("button", { name: /buy lifetime/i }));

			expect(startCheckout).toHaveBeenCalledWith("lifetime");
			expect(assignMock).toHaveBeenCalledWith(
				"https://sandbox.polar.sh/checkout?x=y",
			);
		});

		it("shows an error dialog when lifetime checkout fails", async () => {
			const user = userEvent.setup();
			useBillingStore.setState({
				status: {
					tier: "yearly",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
				startCheckout: vi.fn().mockRejectedValue(new Error("Polar down")),
			});

			renderWithProviders(<SettingsBillingCard />);

			await user.click(screen.getByRole("button", { name: /buy lifetime/i }));

			expect(
				screen.getByRole("heading", { name: "Checkout failed" }),
			).toBeInTheDocument();
			expect(assignMock).not.toHaveBeenCalled();
		});

		it("shows an error dialog when the portal cannot be opened", async () => {
			const user = userEvent.setup();
			useBillingStore.setState({
				status: {
					tier: "monthly",
					isPaid: true,
					roomLimit: null,
					roomCount: 6,
				},
				hasStatusFetched: true,
				startPortal: vi.fn().mockRejectedValue(new Error("Polar down")),
			});

			renderWithProviders(<SettingsBillingCard />);

			await user.click(
				screen.getByRole("button", { name: /manage subscription/i }),
			);

			expect(
				screen.getByRole("heading", { name: "Unable to open subscription" }),
			).toBeInTheDocument();
			expect(assignMock).not.toHaveBeenCalled();
		});
	});
});
