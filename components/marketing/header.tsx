import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/marketing/islands/language-switcher";
import { MobileMenu } from "@/components/marketing/islands/mobile-menu";
import { Logo } from "@/components/shared/logo";
import { Link } from "@/lib/navigation";

export async function Header() {
	const t = await getTranslations("header");

	return (
		<header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
			<nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="w-[120px]">
						<Link href="/" className="flex items-center gap-2">
							<Logo />
						</Link>
					</div>
					{/* Desktop Navigation */}
					<div className="hidden md:flex md:items-center md:gap-8">
						<Link
							href="/#problems"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-w-[90px] text-center"
						>
							{t("problems")}
						</Link>
						<Link
							href="/#features"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-w-[90px] text-center"
						>
							{t("features")}
						</Link>
						<Link
							href="/#pricing"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground min-w-[90px] text-center"
						>
							{t("pricing")}
						</Link>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-4 w-[120px] justify-end">
						<LanguageSwitcher />
						<MobileMenu />
					</div>
				</div>
			</nav>
		</header>
	);
}
