import { useTranslations } from "next-intl";
import { PropertyCardSkeleton } from "./property-card-skeleton";

export function PropertyListSkeleton() {
	const t = useTranslations("app.properties");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
					{t("listTitle")}
				</h1>
			</div>

			<div className="grid gap-4">
				<PropertyCardSkeleton />
				<PropertyCardSkeleton />
				<PropertyCardSkeleton />
			</div>

			{/* Add Property button skeleton */}
			<div className="h-11 w-full rounded-lg bg-muted animate-shimmer" />
		</div>
	);
}
