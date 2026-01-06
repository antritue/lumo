import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/dashboard/islands/language-switcher";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export function AppHeader() {
	const t = useTranslations("header");

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<nav className="h-full px-4 sm:px-6">
				<div className="flex h-full items-center justify-between">
					<Link href="/dashboard">
						<Logo />
					</Link>
					<div className="flex items-center gap-4">
						<LanguageSwitcher />
						<Button variant="outline">{t("signIn")}</Button>
					</div>
				</div>
			</nav>
		</header>
	);
}
