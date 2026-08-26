export function OverviewSkeleton() {
	const cardItems = Array.from({ length: 3 }, (_, i) => `card-${i}`);
	const groupItems = Array.from({ length: 2 }, (_, i) => `group-${i}`);
	const rowItems = Array.from({ length: 3 }, (_, i) => `row-${i}`);

	return (
		<div data-testid="overview-skeleton" className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				{cardItems.map((key) => (
					<div
						key={key}
						className="rounded-xl border border-border bg-card p-4 space-y-2"
					>
						<div className="h-4 w-20 rounded bg-muted animate-shimmer" />
						<div className="h-7 w-28 rounded bg-muted animate-shimmer" />
					</div>
				))}
			</div>
			{groupItems.map((groupKey) => (
				<div key={groupKey} className="rounded-xl border border-border bg-card">
					<div className="flex items-center gap-2 px-4 py-3">
						<div className="h-4 w-4 rounded bg-muted animate-shimmer" />
						<div className="h-4 w-32 rounded bg-muted animate-shimmer" />
						<div className="flex-1" />
						<div className="h-6 w-16 rounded-full bg-muted animate-shimmer" />
					</div>
					<div className="border-t border-border p-2 space-y-2">
						{rowItems.map((rowKey) => (
							<div key={rowKey} className="flex items-center gap-3 px-3.5 py-3">
								<div className="h-8 w-8 rounded-full bg-muted animate-shimmer" />
								<div className="flex-1 space-y-1">
									<div className="h-4 w-32 rounded bg-muted animate-shimmer" />
									<div className="h-3 w-16 rounded bg-muted animate-shimmer" />
								</div>
								<div className="h-6 w-16 rounded-md bg-muted animate-shimmer" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
