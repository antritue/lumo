"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreatePropertyForm } from "./create-property-form";
import { DeletePropertyDialog } from "./delete-property-dialog";
import { EditPropertyDialog } from "./edit-property-dialog";
import { PropertyCard } from "./property-card";
import type { Property } from "./types";

interface PropertyListProps {
	properties: Property[];
	onCreateProperty: (name: string) => void;
	onUpdateProperty: (id: string, name: string) => void;
	onDeleteProperty: (id: string) => void;
}

export function PropertyList({
	properties,
	onCreateProperty,
	onUpdateProperty,
	onDeleteProperty,
}: PropertyListProps) {
	const t = useTranslations("app.properties");
	const [isAdding, setIsAdding] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(null);
	const [deletingProperty, setDeletingProperty] = useState<Property | null>(
		null,
	);

	const handleCreate = (name: string) => {
		onCreateProperty(name);
		setIsAdding(false);
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

				{!isAdding ? (
					<Button
						onClick={() => setIsAdding(true)}
						variant="outline"
						size="lg"
						className="w-full"
					>
						<Plus className="mr-2" />
						{t("addAnother")}
					</Button>
				) : (
					<CreatePropertyForm
						onSubmit={handleCreate}
						onCancel={() => setIsAdding(false)}
						showCancel
					/>
				)}
			</div>

			<EditPropertyDialog
				property={editingProperty}
				open={!!editingProperty}
				onOpenChange={(open) => !open && setEditingProperty(null)}
				onSave={onUpdateProperty}
			/>

			<DeletePropertyDialog
				property={deletingProperty}
				open={!!deletingProperty}
				onOpenChange={(open) => !open && setDeletingProperty(null)}
				onDelete={onDeleteProperty}
			/>
		</>
	);
}
