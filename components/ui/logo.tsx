import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
	href?: string;
	className?: string;
}

export function Logo({ className }: LogoProps) {
	return (
		<div className={cn("flex items-center gap-2", className)}>
			<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
				<Sun className="h-4 w-4 text-primary-foreground" />
			</div>
			<span className="text-xl font-semibold text-foreground">Lumo</span>
		</div>
	);
}
