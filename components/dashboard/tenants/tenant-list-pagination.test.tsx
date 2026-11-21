import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/render";
import { TenantListPagination } from "./tenant-list-pagination";

const renderPagination = (
	page: number,
	totalPages: number,
	onPageChange = vi.fn(),
) => {
	renderWithProviders(
		<TenantListPagination
			page={page}
			totalPages={totalPages}
			onPageChange={onPageChange}
		/>,
	);
	return onPageChange;
};

const pagesNav = () =>
	screen.getByRole("navigation", { name: "Tenant list pages" });

describe("TenantListPagination", () => {
	it("renders nothing for a single page", () => {
		const { container } = renderWithProviders(
			<TenantListPagination page={1} totalPages={1} onPageChange={vi.fn()} />,
		);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders all pages with the current one marked", async () => {
		const user = userEvent.setup();
		const onPageChange = renderPagination(2, 4);

		const nav = pagesNav();
		expect(
			within(nav).getAllByRole("button", { name: /^Go to page \d+$/ }),
		).toHaveLength(4);
		expect(
			within(nav).getByRole("button", { name: "Go to page 2" }),
		).toHaveAttribute("aria-current", "page");

		await user.click(within(nav).getByRole("button", { name: "Go to page 3" }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});

	it("shows the first and last pages with two gaps in the middle", () => {
		renderPagination(5, 10);

		const nav = pagesNav();
		expect(
			within(nav).getByRole("button", { name: "Go to page 1" }),
		).toBeInTheDocument();
		expect(
			within(nav).getByRole("button", { name: "Go to page 10" }),
		).toBeInTheDocument();
		expect(
			within(nav).queryByRole("button", { name: "Go to page 3" }),
		).not.toBeInTheDocument();
		expect(within(nav).getAllByText("…")).toHaveLength(2);
		expect(within(nav).getByText("Page 5 of 10")).toBeInTheDocument();
	});

	it("keeps the window near the first page and disables Previous", async () => {
		const user = userEvent.setup();
		const onPageChange = renderPagination(1, 10);

		const nav = pagesNav();
		expect(
			within(nav).getByRole("button", { name: "Go to page 4" }),
		).toBeInTheDocument();
		expect(
			within(nav).queryByRole("button", { name: "Go to page 5" }),
		).not.toBeInTheDocument();
		expect(within(nav).getAllByText("…")).toHaveLength(1);
		expect(
			within(nav).getByRole("button", { name: "Previous page" }),
		).toBeDisabled();

		await user.click(within(nav).getByRole("button", { name: "Next page" }));
		expect(onPageChange).toHaveBeenCalledWith(2);
	});

	it("keeps the window near the last page and disables Next", () => {
		renderPagination(10, 10);

		const nav = pagesNav();
		expect(
			within(nav).getByRole("button", { name: "Go to page 7" }),
		).toBeInTheDocument();
		expect(
			within(nav).queryByRole("button", { name: "Go to page 6" }),
		).not.toBeInTheDocument();
		expect(within(nav).getAllByText("…")).toHaveLength(1);
		expect(
			within(nav).getByRole("button", { name: "Next page" }),
		).toBeDisabled();
	});
});
