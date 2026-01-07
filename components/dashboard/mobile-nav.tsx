"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard/properties", icon: Home, labelKey: "properties" },
] as const;

export function MobileNav() {
	const pathname = usePathname();
	const t = useTranslations("app.sidebar");

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
			<div className="flex items-center justify-around h-16 px-2">
				{navItems.map((item) => {
					const isActive = pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 min-w-[72px] transition-colors",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							<item.icon className="h-5 w-5" />
							<span className="text-xs font-medium">{t(item.labelKey)}</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
