import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { ErrorState } from "./error-state";

describe("ErrorState", () => {
	it("renders default state without retry button", () => {
		renderWithProviders(<ErrorState />);

		expect(
			screen.getByRole("heading", { name: /failed to load data/i }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /try again/i }),
		).not.toBeInTheDocument();
	});

	it("renders retry button and handles click", async () => {
		const handleRetry = vi.fn();
		const user = userEvent.setup();

		renderWithProviders(<ErrorState onRetry={handleRetry} />);

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(handleRetry).toHaveBeenCalledTimes(1);
	});
});
