import { Blocks, Home, MessageSquare, Settings, Users } from "lucide-react";
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
	{
		href: "/dashboard/services",
		icon: Blocks,
		labelKey: "services",
		activeMatch: ["/dashboard/services"],
	},
	{
		href: "/dashboard/tenants",
		icon: Users,
		labelKey: "tenants",
		activeMatch: ["/dashboard/tenants"],
	},
	{
		href: "/dashboard/feedback",
		icon: MessageSquare,
		labelKey: "feedback",
		activeMatch: ["/dashboard/feedback"],
	},
	{
		href: "/dashboard/settings",
		icon: Settings,
		labelKey: "settings",
		activeMatch: ["/dashboard/settings"],
	},
];

/**
 * Checks if a pathname matches a navigation item.
 */
export function isPathActive(pathname: string, item: NavItem): boolean {
	const matches = item.activeMatch ?? [item.href];
	return matches.some((pattern) => pathname.startsWith(pattern));
}
