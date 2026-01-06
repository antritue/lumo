import { AppHeader } from "@/components/dashboard/header";
import { AppSidebar } from "@/components/dashboard/sidebar";

interface AppShellProps {
	children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
	return (
		<div className="min-h-screen bg-background">
			<AppHeader />
			<AppSidebar />
			<main className="pl-64 pt-16">
				<div className="p-6">{children}</div>
			</main>
		</div>
	);
}
