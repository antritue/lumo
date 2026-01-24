"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/dashboard/islands/language-switcher";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { TabletNav } from "./tablet-nav";

export function AppHeader() {
	const t = useTranslations("header");

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<nav className="h-full px-4 sm:px-6">
				<div className="flex h-full items-center justify-between">
					<div className="flex items-center gap-3">
						{/* Tablet menu trigger (hidden on mobile and desktop) */}
						<Sheet>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="hidden md:flex lg:hidden"
								>
									<Menu className="h-5 w-5" />
									<span className="sr-only">Open menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-64">
								<SheetHeader>
									<SheetTitle>{t("menu", { default: "Menu" })}</SheetTitle>
								</SheetHeader>
								<TabletNav />
							</SheetContent>
						</Sheet>

						<Link href="/dashboard">
							<Logo />
						</Link>
					</div>
					<div className="flex items-center gap-2 sm:gap-4">
						<LanguageSwitcher />
						<Button variant="outline" className="w-24 text-sm px-3">
							{t("signIn")}
						</Button>
					</div>
				</div>
			</nav>
		</header>
	);
}
