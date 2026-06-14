"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeletePropertyDialog } from "./delete-property-dialog";
import { PropertyCard } from "./property-card";
import { usePropertiesStore } from "./store";
import type { Property } from "./types";
import { UpsertPropertyDialog } from "./upsert-property-dialog";

export function PropertyList() {
	const t = useTranslations("app.properties");
	const properties = usePropertiesStore((state) => state.properties);
	const createProperty = usePropertiesStore((state) => state.createProperty);
	const updateProperty = usePropertiesStore((state) => state.updateProperty);
	const deleteProperty = usePropertiesStore((state) => state.deleteProperty);

	const [isAdding, setIsAdding] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(null);
	const [deletingProperty, setDeletingProperty] = useState<Property | null>(
		null,
	);

	const handleSave = async (id: string | null, name: string) => {
		if (id) {
			await updateProperty(id, name);
		} else {
			await createProperty(name);
		}
	};

	return (
		<>
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
						{t("listTitle")}
					</h1>
				</div>

				<div className="grid gap-4">
					{properties.map((property) => (
						<PropertyCard
							key={property.id}
							property={property}
							onEdit={setEditingProperty}
							onDelete={setDeletingProperty}
						/>
					))}
				</div>

				<Button onClick={() => setIsAdding(true)} size="lg" className="w-full">
					<Plus className="mr-2" />
					{t("addAnother")}
				</Button>
			</div>

			<UpsertPropertyDialog
				mode="add"
				open={isAdding}
				onOpenChange={setIsAdding}
				onSave={handleSave}
			/>

			<UpsertPropertyDialog
				mode="edit"
				property={editingProperty ?? undefined}
				open={!!editingProperty}
				onOpenChange={(open) => !open && setEditingProperty(null)}
				onSave={handleSave}
			/>

			<DeletePropertyDialog
				property={deletingProperty}
				open={!!deletingProperty}
				onOpenChange={(open) => !open && setDeletingProperty(null)}
				onDelete={deleteProperty}
			/>
		</>
	);
}
