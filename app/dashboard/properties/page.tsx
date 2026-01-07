"use client";

import {
	EmptyState,
	PropertyList,
	usePropertiesStore,
} from "@/components/dashboard/properties";

export default function PropertiesPage() {
	const properties = usePropertiesStore((state) => state.properties);

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			{properties.length === 0 ? <EmptyState /> : <PropertyList />}
		</div>
	);
}
