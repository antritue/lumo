import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { ServiceList } from "./service-list";
import { useServicesStore } from "./store";
import type { Service } from "./types";

describe("ServiceList", () => {
	const mockService = (overrides: Partial<Service> = {}): Service => ({
		id: "1",
		userId: "test-user-id",
		name: "Electricity",
		unitLabel: "kWh",
		pricingType: "variable",
		flatAmount: null,
		unitPrice: 0.15,
		...overrides,
	});

	beforeEach(() => {
		useServicesStore.setState({
			services: [mockService()],
			isServicesLoading: false,
			hasServicesFetched: true,
			servicesFetchFailed: false,
		});
		vi.restoreAllMocks();
	});

	describe("Display", () => {
		it("displays services with add button", () => {
			renderWithProviders(<ServiceList />);

			expect(screen.getByText("Electricity")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /add a new service/i }),
			).toBeInTheDocument();
		});

		it("displays hint suggestions for services not yet added", () => {
			renderWithProviders(<ServiceList />);

			expect(screen.getByText(/quick add/i)).toBeInTheDocument();
			expect(screen.getByText("Water")).toBeInTheDocument();
			expect(screen.getByText("WiFi")).toBeInTheDocument();
			expect(screen.getByText("Cleaning")).toBeInTheDocument();
			expect(screen.getByText("Parking")).toBeInTheDocument();
		});

		it("does not show hint for a service already in the list", () => {
			renderWithProviders(<ServiceList />);

			const hintButtons = screen.getByText(/quick add/i)
				.nextElementSibling as HTMLElement | null;
			expect(hintButtons).not.toBeNull();
			expect(
				within(hintButtons as HTMLElement).queryByText("Electricity"),
			).not.toBeInTheDocument();
		});

		it("hides hint suggestions already added", () => {
			useServicesStore.setState({
				services: [mockService({ name: "WiFi" })],
			});

			renderWithProviders(<ServiceList />);

			expect(screen.getByText(/quick add/i)).toBeInTheDocument();
			const hintButtons = screen.getByText(/quick add/i)
				.nextElementSibling as HTMLElement | null;
			expect(hintButtons).not.toBeNull();
			expect(
				within(hintButtons as HTMLElement).queryByText("WiFi"),
			).not.toBeInTheDocument();
			expect(
				within(hintButtons as HTMLElement).getByText("Cleaning"),
			).toBeInTheDocument();
		});

		it("hides the entire hint section when all hints are added", () => {
			useServicesStore.setState({
				services: [
					mockService({ name: "Electricity" }),
					mockService({ name: "Water" }),
					mockService({ name: "WiFi" }),
					mockService({ name: "Cleaning" }),
					mockService({ name: "Parking" }),
				],
			});

			renderWithProviders(<ServiceList />);

			expect(screen.queryByText(/quick add/i)).not.toBeInTheDocument();
		});
	});

	describe("Adding Services", () => {
		it("shows dialog, creates service, and hides dialog", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceList />);

			await user.click(
				screen.getByRole("button", { name: /add a new service/i }),
			);

			const dialog = screen.getByRole("dialog");
			const input = within(dialog).getByPlaceholderText(/service name/i);
			expect(input).toBeInTheDocument();

			await user.type(input, "Parking");
			await user.click(
				within(dialog).getByRole("button", { name: /add service/i }),
			);

			expect(
				screen.queryByPlaceholderText(/service name/i),
			).not.toBeInTheDocument();
		});

		it("adds hint service when hint button is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceList />);

			const hintButton = screen.getByRole("button", { name: "WiFi" });
			await user.click(hintButton);

			const { services } = useServicesStore.getState();
			expect(services).toHaveLength(2);
			expect(services[1].name).toBe("WiFi");
		});

		it("hides dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceList />);

			await user.click(
				screen.getByRole("button", { name: /add a new service/i }),
			);
			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /cancel/i,
				}),
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	describe("Editing Services", () => {
		it("opens dialog with service data for editing", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceList />);

			await user.click(screen.getByRole("button", { name: /edit/i }));

			const dialog = screen.getByRole("dialog");
			expect(within(dialog).getByPlaceholderText(/service name/i)).toHaveValue(
				"Electricity",
			);
			expect(
				within(dialog).getByRole("button", { name: /save/i }),
			).toBeEnabled();
		});

		it("closes dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceList />);

			await user.click(screen.getByRole("button", { name: /edit/i }));
			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /cancel/i,
				}),
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	describe("Deleting Services", () => {
		it("opens dialog, deletes service, and closes", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceList />);

			await user.click(screen.getByRole("button", { name: /delete/i }));

			const dialog = screen.getByRole("dialog");
			await user.click(
				within(dialog).getByRole("button", { name: /delete service/i }),
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});

		it("closes dialog when cancel is clicked", async () => {
			const user = userEvent.setup();
			renderWithProviders(<ServiceList />);

			await user.click(screen.getByRole("button", { name: /delete/i }));
			await user.click(
				within(screen.getByRole("dialog")).getByRole("button", {
					name: /cancel/i,
				}),
			);

			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});
});
