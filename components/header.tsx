import { Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JoinWaitlistDialog } from "@/components/islands/join-waitlist-dialog";
import { MobileMenu } from "@/components/islands/mobile-menu";

export function Header() {
    const waitlistTrigger = (
        <JoinWaitlistDialog
            trigger={<Button>Get Early Access</Button>}
        />
    );

    const signInTrigger = (
        <JoinWaitlistDialog
            trigger={<Button variant="ghost">Sign In</Button>}
        />
    );

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
            <nav className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Sun className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-semibold text-foreground">Lumo</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:gap-8">
                        <a
                            href="#features"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Features
                        </a>
                        <a
                            href="#pricing"
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Pricing
                        </a>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex md:items-center md:gap-4">
                        {signInTrigger}
                        {waitlistTrigger}
                    </div>

                    {/* Mobile Menu */}
                    {/* We pass a simplified trigger for mobile, or the component itself allows composition */}
                    <MobileMenu
                        waitlistTrigger={
                            <JoinWaitlistDialog
                                trigger={<Button className="w-full">Get Early Access</Button>}
                            />
                        }
                    />
                </div>
            </nav>
        </header>
    );
}
