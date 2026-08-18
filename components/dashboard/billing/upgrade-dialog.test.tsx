import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { useBillingStore } from "./store";
import { UpgradeDialog } from "./upgrade-dialog";

const assignMock = vi.fn();

Object.defineProperty(window, "location", {
	value: { assign: assignMock },
	writable: true,
});

describe("UpgradeDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useBillingStore.setState({
			isCheckoutLoading: false,
			startCheckout: vi.fn(),
		});
	});

	describe("Display", () => {
		it("shows the upgrade title and all three paid tiers", () => {
			renderWithProviders(<UpgradeDialog open={true} onOpenChange={vi.fn()} />);

			expect(
				screen.getByRole("heading", { name: /upgrade for unlimited rooms/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /monthly/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /yearly/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /lifetime/i }),
			).toBeInTheDocument();
			expect(screen.getByText(/most popular/i)).toBeInTheDocument();
			expect(screen.getByText(/best value/i)).toBeInTheDocument();
		});
	});

	describe("Interactions", () => {
		it("starts checkout and redirects on tier click", async () => {
			const user = userEvent.setup();
			const startCheckout = vi
				.fn()
				.mockResolvedValue("https://checkout.polar.sh/x");
			useBillingStore.setState({ startCheckout });

			renderWithProviders(<UpgradeDialog open={true} onOpenChange={vi.fn()} />);

			await user.click(screen.getByRole("button", { name: /^monthly/i }));

			expect(startCheckout).toHaveBeenCalledWith("monthly");
			expect(assignMock).toHaveBeenCalledWith("https://checkout.polar.sh/x");
		});

		it("shows a loading spinner on the active tier while checkout starts", async () => {
			const user = userEvent.setup();
			let resolveCheckout!: (url: string) => void;
			const checkoutPromise = new Promise<string>((resolve) => {
				resolveCheckout = resolve;
			});
			useBillingStore.setState({
				startCheckout: vi.fn(() => {
					useBillingStore.setState({ isCheckoutLoading: true });
					return checkoutPromise;
				}),
			});

			renderWithProviders(<UpgradeDialog open={true} onOpenChange={vi.fn()} />);

			await user.click(screen.getByRole("button", { name: /^monthly/i }));

			expect(screen.getAllByTestId("checkout-loader")).toHaveLength(1);
			resolveCheckout("https://checkout.polar.sh/x");
			await checkoutPromise;
		});

		it("disables all tiers and cancel while a checkout is in flight", async () => {
			const user = userEvent.setup();
			useBillingStore.setState({
				startCheckout: vi.fn(() => new Promise<string>(() => {})),
			});

			renderWithProviders(<UpgradeDialog open={true} onOpenChange={vi.fn()} />);

			await user.click(screen.getByRole("button", { name: /^monthly/i }));

			expect(screen.getByRole("button", { name: /^monthly/i })).toBeDisabled();
			expect(screen.getByRole("button", { name: /^yearly/i })).toBeDisabled();
			expect(screen.getByRole("button", { name: /^lifetime/i })).toBeDisabled();
			expect(screen.getByRole("button", { name: /^cancel$/i })).toBeDisabled();
		});

		it("shows an error dialog when checkout fails", async () => {
			const user = userEvent.setup();
			const startCheckout = vi
				.fn()
				.mockRejectedValue(new Error("checkout failed"));
			useBillingStore.setState({ startCheckout });

			renderWithProviders(<UpgradeDialog open={true} onOpenChange={vi.fn()} />);

			await user.click(screen.getByRole("button", { name: /^monthly/i }));

			expect(
				await screen.findByText(/problem starting checkout/i),
			).toBeInTheDocument();
			expect(assignMock).not.toHaveBeenCalled();
		});

		it("closes the dialog on cancel", async () => {
			const user = userEvent.setup();
			const onOpenChange = vi.fn();

			renderWithProviders(
				<UpgradeDialog open={true} onOpenChange={onOpenChange} />,
			);

			await user.click(screen.getByRole("button", { name: /^cancel$/i }));
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});
	});
});
