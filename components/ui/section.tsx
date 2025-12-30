import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
	id?: string;
	children: ReactNode;
	className?: string;
	containerClassName?: string;
	variant?: "default" | "secondary" | "transparent";
}

export function Section({
	id,
	children,
	className,
	containerClassName,
	variant = "default",
}: SectionProps) {
	const variants = {
		default: "bg-background",
		secondary: "bg-secondary/30",
		transparent: "bg-transparent",
	};

	return (
		<section
			id={id}
			className={cn(
				"py-24 transition-all duration-1000 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 fill-mode-both",
				variants[variant],
				className,
			)}
		>
			<div
				className={cn(
					"mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
					containerClassName,
				)}
			>
				{children}
			</div>
		</section>
	);
}
