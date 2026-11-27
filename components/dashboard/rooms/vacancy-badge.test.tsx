import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { VacantBadge } from "./vacancy-badge";

describe("VacantBadge", () => {
	it("renders the vacant label", () => {
		renderWithProviders(<VacantBadge />);

		expect(screen.getByText("Vacant")).toBeInTheDocument();
	});
});
