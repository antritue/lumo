import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { EmptyState } from "./empty-state";
import { useServicesStore } from "./store";

describe("EmptyState", () => {
	beforeEach(() => {
		useServicesStore.setState({ services: [] });
		vi.restoreAllMocks();
	});

	it("displays empty state message and add button", () => {
		renderWithProviders(<EmptyState />);

		expect(
			screen.getByRole("heading", { name: /no services yet/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add service/i }),
		).toBeInTheDocument();
	});

	it("shows quick add hint buttons", () => {
		renderWithProviders(<EmptyState />);

		expect(screen.getByText(/quick add common services/i)).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^electricity$/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^water$/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /^wifi$/i })).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^cleaning$/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^parking$/i }),
		).toBeInTheDocument();
	});

	it("hides hint buttons for services already created", () => {
		useServicesStore.setState({
			services: [
				{
					id: "1",
					userId: "",
					name: "WiFi",
					unitLabel: null,
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
				},
				{
					id: "2",
					userId: "",
					name: "Electricity",
					unitLabel: null,
					pricingType: "flat",
					flatAmount: null,
					unitPrice: null,
				},
			],
		});

		renderWithProviders(<EmptyState />);

		expect(
			screen.queryByRole("button", { name: /^wifi$/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^electricity$/i }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^water$/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^cleaning$/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /^parking$/i }),
		).toBeInTheDocument();
	});

	it("opens dialog when add button is clicked", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add service/i }));

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(
			screen.getByRole("textbox", { name: /service name/i }),
		).toBeInTheDocument();
	});

	it("creates first service and closes dialog on submit", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /add service/i }));

		const input = screen.getByRole("textbox", { name: /service name/i });
		const saveButton = screen.getByRole("button", { name: /add service/i });

		await user.type(input, "Electricity");
		await user.click(saveButton);

		const { services } = useServicesStore.getState();
		expect(services).toHaveLength(1);
		expect(services[0].name).toBe("Electricity");

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("creates service via quick add hint button", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /^wifi$/i }));

		const { services } = useServicesStore.getState();
		expect(services).toHaveLength(1);
		expect(services[0].name).toBe("WiFi");
	});

	it("removes hint button after adding via quick add", async () => {
		const user = userEvent.setup();
		renderWithProviders(<EmptyState />);

		await user.click(screen.getByRole("button", { name: /^wifi$/i }));

		expect(
			screen.queryByRole("button", { name: /^wifi$/i }),
		).not.toBeInTheDocument();
	});
});
