import { AuthReminderBanner } from "../auth/auth-reminder-banner";
import { AppHeader } from "./header";
import { MobileNav } from "./mobile-nav";
import { AppSidebar } from "./sidebar";

interface AppShellProps {
	children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="min-h-screen bg-background">
			<AppHeader />
			<AppSidebar />
			<main className="pt-16 lg:pl-64">
				<div className="p-4 sm:p-6">
					<AuthReminderBanner />
					{children}
				</div>
			</main>
			<MobileNav />
		</div>
	);
}
