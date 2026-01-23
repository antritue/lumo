import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { RoomNotFound } from "./room-not-found";

describe("RoomNotFound", () => {
	it("displays not found message and back button", () => {
		renderWithProviders(<RoomNotFound />);

		expect(
			screen.getByRole("heading", { name: /not found/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to properties/i }),
		).toBeInTheDocument();
	});
});
