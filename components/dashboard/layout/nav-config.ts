import { Home } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type NavItem = {
	href: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	labelKey: string;
	activeMatch?: string[];
};

export const navItems: NavItem[] = [
	{
		href: "/dashboard/properties",
		icon: Home,
		labelKey: "properties",
		activeMatch: ["/dashboard/properties", "/dashboard/rooms"],
	},
];

/**
 * Checks if a pathname matches a navigation item.
 */
export function isPathActive(pathname: string, item: NavItem): boolean {
	const matches = item.activeMatch ?? [item.href];
	return matches.some((pattern) => pathname.startsWith(pattern));
}
