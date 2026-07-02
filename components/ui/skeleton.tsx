import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
	return (
		<div
			className={cn("bg-muted animate-shimmer rounded shrink-0", className)}
		/>
	);
}
