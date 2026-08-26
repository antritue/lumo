"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { OverviewEmptyState } from "@/components/dashboard/overview/empty-state";
import { OverviewSkeleton } from "@/components/dashboard/overview/overview-skeleton";
import { PropertyGroup } from "@/components/dashboard/overview/property-group";
import { useOverviewStore } from "@/components/dashboard/overview/store";
import { SummaryCards } from "@/components/dashboard/overview/summary-cards";
import { MonthPicker } from "@/components/dashboard/rent-payments/month-picker";
import { ErrorState } from "@/components/shared/error-state";

function defaultPeriod(): string {
	const now = new Date();
	return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
}

export default function OverviewPage() {
	const t = useTranslations("app.overview");
	const snapshot = useOverviewStore((state) => state.snapshot);
	const summary = useOverviewStore((state) => state.summary);
	const isOverviewLoading = useOverviewStore(
		(state) => state.isOverviewLoading,
	);
	const hasOverviewFetched = useOverviewStore(
		(state) => state.hasOverviewFetched,
	);
	const isOverviewFetchFailed = useOverviewStore(
		(state) => state.isOverviewFetchFailed,
	);
	const fetchOverview = useOverviewStore((state) => state.fetchOverview);

	const [period, setPeriod] = useState(defaultPeriod);

	useEffect(() => {
		fetchOverview(period);
	}, [period, fetchOverview]);

	let content: React.JSX.Element;
	if (isOverviewFetchFailed && !isOverviewLoading) {
		content = <ErrorState onRetry={() => fetchOverview(period)} />;
	} else if (!hasOverviewFetched || isOverviewLoading) {
		content = <OverviewSkeleton />;
	} else if (snapshot && summary) {
		content = (
			<div className="space-y-6">
				<SummaryCards summary={summary} />
				{snapshot.rooms.length === 0 ? (
					<OverviewEmptyState />
				) : (
					<div className="space-y-4">
						{snapshot.properties.map((property) => (
							<PropertyGroup key={property.id} property={property} />
						))}
					</div>
				)}
			</div>
		);
	} else {
		content = <OverviewSkeleton />;
	}

	return (
		<div className="max-w-4xl mx-auto py-4 px-4">
			<div className="flex items-center justify-between gap-4 pb-4 sm:pb-5 border-b border-border">
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
					{t("listTitle")}
				</h1>
				<MonthPicker
					value={period}
					onChange={(value) => {
						if (value) setPeriod(value);
					}}
					className="h-9 w-40"
				/>
			</div>
			<div className="pt-4 sm:pt-6">{content}</div>
		</div>
	);
}
