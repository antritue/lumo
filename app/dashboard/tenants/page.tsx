"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { TenantEmptyState } from "@/components/dashboard/tenants/empty-state";
import { useTenantsStore } from "@/components/dashboard/tenants/store";
import { TenantList } from "@/components/dashboard/tenants/tenant-list";
import { TenantListSkeleton } from "@/components/dashboard/tenants/tenant-list-skeleton";
import { ErrorState } from "@/components/shared/error-state";

export default function TenantsPage() {
	const t = useTranslations("app.tenants");
	const tenants = useTenantsStore((state) => state.tenants);
	const isTenantsLoading = useTenantsStore((state) => state.isTenantsLoading);
	const hasTenantsFetched = useTenantsStore((state) => state.hasTenantsFetched);
	const isTenantsFetchFailed = useTenantsStore(
		(state) => state.isTenantsFetchFailed,
	);
	const fetchTenants = useTenantsStore((state) => state.fetchTenants);
	const fetchProperties = usePropertiesStore((state) => state.fetchProperties);
	const fetchAllRooms = useRoomsStore((state) => state.fetchAllRooms);
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);

	useEffect(() => {
		if (!user) return;
		void Promise.allSettled([
			fetchTenants(),
			fetchProperties(),
			fetchAllRooms(),
		]);
	}, [user, fetchTenants, fetchProperties, fetchAllRooms]);

	let content: React.JSX.Element;
	if (isTenantsFetchFailed && !isTenantsLoading) {
		content = <ErrorState onRetry={fetchTenants} />;
	} else if (
		(!hasTenantsFetched || isTenantsLoading) &&
		(user || authLoading)
	) {
		content = <TenantListSkeleton />;
	} else if (tenants.length === 0) {
		content = <TenantEmptyState />;
	} else {
		content = <TenantList />;
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
