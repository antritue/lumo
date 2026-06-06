"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { EmptyState } from "@/components/dashboard/properties/empty-state";
import { PropertyList } from "@/components/dashboard/properties/property-list";
import { PropertyListSkeleton } from "@/components/dashboard/properties/property-list-skeleton";
import { usePropertiesStore } from "@/components/dashboard/properties/store";

export default function PropertiesPage() {
	const properties = usePropertiesStore((state) => state.properties);
	const isPropertiesLoading = usePropertiesStore(
		(state) => state.isPropertiesLoading,
	);
	const hasPropertiesFetched = usePropertiesStore(
		(state) => state.hasPropertiesFetched,
	);
	const fetchProperties = usePropertiesStore((state) => state.fetchProperties);
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);

	useEffect(() => {
		if (user) {
			fetchProperties();
		}
	}, [user, fetchProperties]);

	if ((!hasPropertiesFetched || isPropertiesLoading) && (user || authLoading)) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<PropertyListSkeleton />
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			{properties.length === 0 ? <EmptyState /> : <PropertyList />}
		</div>
	);
}
