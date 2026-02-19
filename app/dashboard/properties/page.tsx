"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import {
	EmptyState,
	PropertyList,
	PropertyListSkeleton,
	usePropertiesStore,
} from "@/components/dashboard/properties";

export default function PropertiesPage() {
	const properties = usePropertiesStore((state) => state.properties);
	const isLoading = usePropertiesStore((state) => state.isLoading);
	const fetchProperties = usePropertiesStore((state) => state.fetchProperties);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		if (user) {
			fetchProperties();
		}
	}, [user, fetchProperties]);

	if (isLoading) {
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
