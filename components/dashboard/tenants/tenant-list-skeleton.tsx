export function TenantListSkeleton() {
	const rows = Array.from(
		{ length: 6 },
		(_, index) => `tenant-skeleton-${index}`,
	);
	const pageSkeletons = Array.from(
		{ length: 4 },
		(_, index) => `page-skeleton-${index}`,
	);

	return (
		<div className="space-y-4 pt-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="h-10 w-full rounded-full bg-muted animate-shimmer sm:w-64" />
				<div className="h-10 w-full rounded-full bg-muted animate-shimmer sm:w-56" />
			</div>

			<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
				<div className="hidden h-10 border-b border-border/60 bg-secondary/30 sm:block" />
				<div className="divide-y divide-border/60">
					{rows.map((key) => (
						<div key={key} className="flex items-center gap-3 px-4 py-3.5">
							<div className="flex-1 space-y-2">
								<div className="h-4 w-40 rounded bg-muted animate-shimmer" />
								<div className="h-3 w-24 rounded bg-muted animate-shimmer" />
							</div>
							<div className="hidden h-4 w-28 rounded bg-muted animate-shimmer sm:block" />
							<div className="hidden h-4 w-32 rounded bg-muted animate-shimmer sm:block" />
							<div className="h-5 w-16 rounded-full bg-muted animate-shimmer" />
						</div>
					))}
				</div>

				<div className="flex items-center justify-center gap-1 border-t border-border/60 px-4 py-3">
					<div className="h-8 w-8 rounded-full bg-muted animate-shimmer" />
					<div className="h-3 w-20 rounded bg-muted animate-shimmer sm:hidden" />
					<div className="hidden items-center gap-1 sm:flex">
						{pageSkeletons.map((key) => (
							<div
								key={key}
								className="h-8 w-8 rounded-full bg-muted animate-shimmer"
							/>
						))}
					</div>
					<div className="h-8 w-8 rounded-full bg-muted animate-shimmer" />
				</div>
			</div>
		</div>
	);
}
