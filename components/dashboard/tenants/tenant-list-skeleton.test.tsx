import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { TenantListSkeleton } from "./tenant-list-skeleton";

describe("TenantListSkeleton", () => {
	it("renders shimmer placeholders", () => {
		const { container } = renderWithProviders(<TenantListSkeleton />);

		expect(
			container.querySelectorAll("[class*='animate-shimmer']").length,
		).toBeGreaterThan(0);
	});

	it("reserves space for pagination below the rows", () => {
		const { container } = renderWithProviders(<TenantListSkeleton />);
		const footer = container.querySelector(".border-t");

		expect(footer).not.toBeNull();
		expect(
			footer?.querySelectorAll("[class*='animate-shimmer']").length,
		).toBeGreaterThan(0);
	});
});
