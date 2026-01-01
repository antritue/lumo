import { Sun } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { JoinWaitlistDialog } from "@/components/islands/join-waitlist-dialog";
import { LanguageSwitcher } from "@/components/islands/language-switcher";
import { MobileMenu } from "@/components/islands/mobile-menu";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

export async function Header() {
	const t = await getTranslations("header");

	const signInTrigger = (
		<JoinWaitlistDialog
			trigger={<Button variant="outline">{t("signIn")}</Button>}
		/>
	);

	return (
		<header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
			<nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Sun className="h-4 w-4 text-primary-foreground" />
						</div>
						<span className="text-xl font-semibold text-foreground">Lumo</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex md:items-center md:gap-8">
						<Link
							href="/#features"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{t("features")}
						</Link>
						<Link
							href="/#pricing"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{t("pricing")}
						</Link>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-4">
						<LanguageSwitcher />
						<div className="hidden md:block">{signInTrigger}</div>
						<MobileMenu />
					</div>
				</div>
			</nav>
		</header>
	);
}
