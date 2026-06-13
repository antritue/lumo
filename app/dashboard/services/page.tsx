"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { EmptyState } from "@/components/dashboard/services/empty-state";
import { ServiceList } from "@/components/dashboard/services/service-list";
import { ServiceListSkeleton } from "@/components/dashboard/services/service-list-skeleton";
import { useServicesStore } from "@/components/dashboard/services/store";
import { ErrorState } from "@/components/shared/error-state";

export default function ServicesPage() {
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

	if (servicesFetchFailed && !isServicesLoading) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<ErrorState onRetry={fetchServices} />
			</div>
		);
	}

	if ((!hasServicesFetched || isServicesLoading) && (user || authLoading)) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<ServiceListSkeleton />
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			{services.length === 0 ? <EmptyState /> : <ServiceList />}
		</div>
	);
}
