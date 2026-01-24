import { Home } from "lucide-react";
import { describe, expect, it } from "vitest";
import { isPathActive, type NavItem } from "./nav-config";

describe("nav-config", () => {
	describe("isPathActive", () => {
		const mockItem: NavItem = {
			href: "/dashboard/properties",
			icon: Home,
			labelKey: "properties",
			activeMatch: ["/dashboard/properties", "/dashboard/rooms"],
		};

		it("returns true for exact match", () => {
			expect(isPathActive("/dashboard/properties", mockItem)).toBe(true);
		});

		it("returns true for sub-paths in activeMatch", () => {
			expect(isPathActive("/dashboard/properties/list", mockItem)).toBe(true);
			expect(isPathActive("/dashboard/rooms/123", mockItem)).toBe(true);
		});

		it("returns false for non-matching paths", () => {
			expect(isPathActive("/dashboard/settings", mockItem)).toBe(false);
			expect(isPathActive("/marketing", mockItem)).toBe(false);
		});

		it("uses href as default match if activeMatch is not provided", () => {
			const itemWithoutMatch: NavItem = {
				href: "/dashboard/tasks",
				icon: Home,
				labelKey: "tasks",
			};
			expect(isPathActive("/dashboard/tasks", itemWithoutMatch)).toBe(true);
			expect(isPathActive("/dashboard/tasks/new", itemWithoutMatch)).toBe(true);
			expect(isPathActive("/dashboard/other", itemWithoutMatch)).toBe(false);
		});
	});
});
