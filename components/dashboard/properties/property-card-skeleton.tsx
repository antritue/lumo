import { Card, CardHeader } from "@/components/ui/card";

export function PropertyCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 flex-1 min-w-0">
						{/* Chevron skeleton */}
						{/* <div className="h-5 w-5 rounded bg-muted animate-shimmer" /> */}

						{/* Icon circle skeleton */}
						<div className="h-10 w-10 rounded-full bg-secondary animate-shimmer" />

						{/* Title and room count skeleton */}
						<div className="flex-1 min-w-0 space-y-2">
							<div className="h-6 w-40 rounded bg-muted animate-shimmer" />
							{/* <div className="h-4 w-24 rounded bg-muted animate-shimmer" /> */}
						</div>
					</div>

					{/* Action buttons skeleton */}
					<div className="flex items-center gap-2">
						<div className="h-5 w-5 rounded bg-muted animate-shimmer" />
						<div className="h-5 w-5 rounded bg-muted animate-shimmer" />
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
