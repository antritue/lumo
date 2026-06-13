import { useTranslations } from "next-intl";
import { ServiceCardSkeleton } from "./service-card-skeleton";

export function ServiceListSkeleton() {
	const t = useTranslations("app.services");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
					{t("listTitle")}
				</h1>
			</div>

			<div className="grid gap-4">
				<ServiceCardSkeleton />
				<ServiceCardSkeleton />
			</div>

			<div className="h-11 w-full rounded-lg bg-muted animate-shimmer" />
		</div>
	);
}
