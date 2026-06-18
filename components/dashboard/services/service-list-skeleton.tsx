import { ServiceCardSkeleton } from "./service-card-skeleton";

export function ServiceListSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4">
				<ServiceCardSkeleton />
				<ServiceCardSkeleton />
			</div>

			<div className="h-11 w-full rounded-lg bg-muted animate-shimmer" />
		</div>
	);
}
