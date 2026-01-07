"use client";

import { useState } from "react";
import {
	EmptyState,
	type Property,
	PropertyList,
} from "@/components/dashboard/properties";

export default function PropertiesPage() {
	const [properties, setProperties] = useState<Property[]>([]);

	const handleCreateProperty = (name: string) => {
		const newProperty: Property = {
			id: crypto.randomUUID(),
			name,
			createdAt: new Date(),
		};

		setProperties([...properties, newProperty]);
	};

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			{properties.length === 0 ? (
				<EmptyState onCreateProperty={handleCreateProperty} />
			) : (
				<PropertyList
					properties={properties}
					onCreateProperty={handleCreateProperty}
				/>
			)}
		</div>
	);
}
