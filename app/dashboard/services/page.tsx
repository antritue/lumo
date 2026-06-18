"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { EmptyState } from "@/components/dashboard/services/empty-state";
import { ServiceList } from "@/components/dashboard/services/service-list";
import { ServiceListSkeleton } from "@/components/dashboard/services/service-list-skeleton";
import { useServicesStore } from "@/components/dashboard/services/store";
import { ErrorState } from "@/components/shared/error-state";

export default function ServicesPage() {
	const t = useTranslations("app.services");
	const services = useServicesStore((state) => state.services);
	const isServicesLoading = useServicesStore(
		(state) => state.isServicesLoading,
	);
	const hasServicesFetched = useServicesStore(
		(state) => state.hasServicesFetched,
	);
	const servicesFetchFailed = useServicesStore(
		(state) => state.servicesFetchFailed,
	);
	const fetchServices = useServicesStore((state) => state.fetchServices);
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);

	useEffect(() => {
		if (!authLoading) fetchServices();
	}, [authLoading, fetchServices]);

	let content: React.JSX.Element;
	if (servicesFetchFailed && !isServicesLoading) {
		content = <ErrorState onRetry={fetchServices} />;
	} else if (
		(!hasServicesFetched || isServicesLoading) &&
		(user || authLoading)
	) {
		content = <ServiceListSkeleton />;
	} else if (services.length === 0) {
		content = <EmptyState />;
	} else {
		content = <ServiceList />;
	}

	return (
		<div className="max-w-4xl mx-auto py-4 px-4">
			<div className="flex items-center pb-4 sm:pb-5 border-b border-border">
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
					{t("listTitle")}
				</h1>
			</div>
			{content}
		</div>
	);
}
