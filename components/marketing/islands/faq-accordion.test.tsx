import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { FaqAccordion } from "./faq-accordion";

const items = [
	{ question: "Question one", answer: "Answer one" },
	{ question: "Question two", answer: "Answer two" },
	{ question: "Question three", answer: "Answer three" },
];

describe("FaqAccordion", () => {
	it("renders all questions as buttons", () => {
		renderWithProviders(<FaqAccordion items={items} />);

		for (const item of items) {
			expect(
				screen.getByRole("button", { name: item.question }),
			).toBeInTheDocument();
		}
	});

	it("starts with all items closed", () => {
		renderWithProviders(<FaqAccordion items={items} />);

		expect(screen.queryByText("Answer one")).not.toBeInTheDocument();
		for (const item of items) {
			expect(
				screen.getByRole("button", { name: item.question }),
			).toHaveAttribute("aria-expanded", "false");
		}
	});

	it("opens an item when its question is clicked", async () => {
		const user = userEvent.setup();
		renderWithProviders(<FaqAccordion items={items} />);

		await user.click(screen.getByRole("button", { name: "Question two" }));

		expect(screen.getByText("Answer two")).toBeInTheDocument();
	});

	it("keeps other items open when a new one is opened", async () => {
		const user = userEvent.setup();
		renderWithProviders(<FaqAccordion items={items} />);

		await user.click(screen.getByRole("button", { name: "Question one" }));
		await user.click(screen.getByRole("button", { name: "Question two" }));

		expect(screen.getByText("Answer one")).toBeInTheDocument();
		expect(screen.getByText("Answer two")).toBeInTheDocument();
	});

	it("closes an open item when clicked again", async () => {
		const user = userEvent.setup();
		renderWithProviders(<FaqAccordion items={items} />);

		await user.click(screen.getByRole("button", { name: "Question one" }));
		expect(screen.getByText("Answer one")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Question one" }));
		expect(screen.queryByText("Answer one")).not.toBeInTheDocument();
	});

	it("reflects open state in aria-expanded", async () => {
		const user = userEvent.setup();
		renderWithProviders(<FaqAccordion items={items} />);

		await user.click(screen.getByRole("button", { name: "Question one" }));
		await user.click(screen.getByRole("button", { name: "Question two" }));

		expect(
			screen.getByRole("button", { name: "Question one" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("button", { name: "Question two" }),
		).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByRole("button", { name: "Question three" }),
		).toHaveAttribute("aria-expanded", "false");
	});
});
