"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { isPathActive, navItems } from "./nav-config";

export function TabletNav() {
	const pathname = usePathname();
	const t = useTranslations("app.sidebar");

	return (
		<nav className="flex flex-col gap-1 mt-6">
			{navItems.map((item) => {
				const isActive = isPathActive(pathname ?? "", item);
				return (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
							isActive
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:bg-secondary hover:text-foreground",
						)}
					>
						<item.icon className="h-5 w-5" />
						{t(item.labelKey)}
					</Link>
				);
			})}
		</nav>
	);
}
