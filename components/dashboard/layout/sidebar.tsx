"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isPathActive, navItems } from "./nav-config";

export function AppSidebar() {
	const pathname = usePathname();
	const t = useTranslations("app.sidebar");

	return (
		<aside className="hidden lg:fixed lg:left-0 lg:top-16 lg:bottom-0 lg:w-64 lg:flex lg:flex-col border-r border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<nav className="flex flex-col gap-1 p-4">
				{navItems.map((item) => {
					const isActive = isPathActive(pathname ?? "", item);

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-secondary hover:text-foreground",
							)}
						>
							<item.icon className="h-4 w-4" />
							{t(item.labelKey)}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
