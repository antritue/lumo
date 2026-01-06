"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard/properties", icon: Home, labelKey: "properties" },
] as const;

export function AppSidebar() {
	const pathname = usePathname();
	const t = useTranslations("app.sidebar");

	return (
		<aside className="fixed left-0 top-16 bottom-0 w-64 border-r border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<nav className="flex flex-col gap-1 p-4">
				{navItems.map((item) => {
					const isActive = pathname.startsWith(item.href);
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
