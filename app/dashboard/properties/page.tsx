"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { EmptyState } from "@/components/dashboard/properties/empty-state";
import { PropertyList } from "@/components/dashboard/properties/property-list";
import { PropertyListSkeleton } from "@/components/dashboard/properties/property-list-skeleton";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { ErrorState } from "@/components/shared/error-state";

export default function PropertiesPage() {
	const t = useTranslations("app.properties");
	const properties = usePropertiesStore((state) => state.properties);
	const isPropertiesLoading = usePropertiesStore(
		(state) => state.isPropertiesLoading,
	);
	const hasPropertiesFetched = usePropertiesStore(
		(state) => state.hasPropertiesFetched,
	);
	const propertiesFetchFailed = usePropertiesStore(
		(state) => state.propertiesFetchFailed,
	);
	const fetchProperties = usePropertiesStore((state) => state.fetchProperties);
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);

	useEffect(() => {
		if (user) {
			fetchProperties();
		}
	}, [user, fetchProperties]);

	let content: React.JSX.Element;
	if (propertiesFetchFailed && !isPropertiesLoading) {
		content = <ErrorState onRetry={fetchProperties} />;
	} else if (
		(!hasPropertiesFetched || isPropertiesLoading) &&
		(user || authLoading)
	) {
		content = <PropertyListSkeleton />;
	} else if (properties.length === 0) {
		content = <EmptyState />;
	} else {
		content = <PropertyList />;
	}

	return (
		<>
			<div className="flex items-center pb-4 sm:pb-5 border-b border-border">
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
					{t("listTitle")}
				</h1>
			</div>
			{content}
		</>
	);
}
