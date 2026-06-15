export function PropertyListSkeleton() {
	const sidebarItems = Array.from({ length: 6 }, (_, i) => `sidebar-${i}`);
	const chipItems = Array.from({ length: 3 }, (_, i) => `chip-${i}`);
	const roomItems = Array.from({ length: 3 }, (_, i) => `room-${i}`);
	const mobileItems = Array.from({ length: 4 }, (_, i) => `mobile-${i}`);

	return (
		<div className="flex h-[calc(100vh-8rem)] -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
			{/* Sidebar skeleton */}
			<div className="flex-1 lg:flex-none lg:w-80 shrink-0 border-r border-border hidden lg:flex flex-col bg-background">
				<div className="flex items-center gap-2 px-3 py-4">
					<div className="flex-1 h-9 rounded-lg bg-muted animate-shimmer" />
					<div className="h-9 w-9 rounded-full bg-muted animate-shimmer" />
				</div>
				<div className="flex-1 space-y-0.5 px-2 py-1">
					{sidebarItems.map((key) => (
						<div
							key={key}
							className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
						>
							<div className="h-8 w-8 rounded-full bg-muted animate-shimmer shrink-0" />
							<div className="flex-1 h-4 w-full rounded bg-muted animate-shimmer" />
						</div>
					))}
				</div>
				<div className="flex items-center justify-between px-3 py-2.5 border-t border-border">
					<div className="h-8 w-16 rounded-full bg-muted animate-shimmer" />
					<div className="h-4 w-12 rounded bg-muted animate-shimmer" />
					<div className="h-8 w-16 rounded-full bg-muted animate-shimmer" />
				</div>
			</div>

			{/* Detail skeleton */}
			<div className="flex-1 min-w-0 hidden lg:flex flex-col bg-card">
				<div className="p-6 space-y-8">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-4">
							<div className="h-12 w-12 rounded-xl bg-muted animate-shimmer" />
							<div className="space-y-2">
								<div className="h-6 w-48 rounded bg-muted animate-shimmer" />
								<div className="h-4 w-36 rounded bg-muted animate-shimmer" />
							</div>
						</div>
						<div className="flex gap-2">
							<div className="h-8 w-16 rounded-full bg-muted animate-shimmer" />
							<div className="h-8 w-16 rounded-full bg-muted animate-shimmer" />
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="h-4 w-16 rounded bg-muted animate-shimmer" />
							<div className="h-5 w-5 rounded-full bg-muted animate-shimmer" />
							<div className="flex-1" />
							<div className="h-8 w-24 rounded-full bg-muted animate-shimmer" />
						</div>
						<div className="flex flex-wrap gap-2">
							{chipItems.map((key) => (
								<div
									key={key}
									className="h-8 w-20 rounded-full bg-muted animate-shimmer"
								/>
							))}
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="h-4 w-12 rounded bg-muted animate-shimmer" />
							<div className="h-5 w-5 rounded-full bg-muted animate-shimmer" />
							<div className="flex-1" />
							<div className="h-8 w-24 rounded-full bg-muted animate-shimmer" />
						</div>
						<div className="space-y-1">
							{roomItems.map((key) => (
								<div key={key} className="flex items-center gap-3 px-3.5 py-3">
									<div className="h-8 w-8 rounded-lg bg-muted animate-shimmer" />
									<div className="flex-1 h-4 w-32 rounded bg-muted animate-shimmer" />
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile skeleton */}
			<div className="flex-1 flex lg:hidden flex-col p-4 space-y-4">
				<div className="flex items-center gap-2">
					<div className="flex-1 h-9 rounded-lg bg-muted animate-shimmer" />
					<div className="h-9 w-9 rounded-full bg-muted animate-shimmer" />
				</div>
				<div className="space-y-2">
					{mobileItems.map((key) => (
						<div
							key={key}
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50"
						>
							<div className="h-8 w-8 rounded-full bg-muted animate-shimmer" />
							<div className="flex-1 h-4 w-3/4 rounded bg-muted animate-shimmer" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
