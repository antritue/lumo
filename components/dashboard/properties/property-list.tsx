"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DeletePropertyDialog } from "./delete-property-dialog";
import { PropertyDetail } from "./property-detail";
import { PropertySidebar } from "./property-sidebar";
import { usePropertiesStore } from "./store";
import type { Property } from "./types";
import { UpsertPropertyDialog } from "./upsert-property-dialog";

export function PropertyList() {
	const t = useTranslations("app.properties");
	const properties = usePropertiesStore((state) => state.properties);
	const createProperty = usePropertiesStore((state) => state.createProperty);
	const updateProperty = usePropertiesStore((state) => state.updateProperty);
	const deleteProperty = usePropertiesStore((state) => state.deleteProperty);

	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
		null,
	);
	const [isAdding, setIsAdding] = useState(false);
	const [editingProperty, setEditingProperty] = useState<Property | null>(null);
	const [deletingProperty, setDeletingProperty] = useState<Property | null>(
		null,
	);
	const [showMobileDetail, setShowMobileDetail] = useState(false);

	const selectedProperty =
		properties.find((p) => p.id === selectedPropertyId) ?? null;

	useEffect(() => {
		if (properties.length > 0 && !selectedPropertyId) {
			setSelectedPropertyId(properties[0].id);
		}
	}, [properties, selectedPropertyId]);

	const handleSelect = (property: Property) => {
		setSelectedPropertyId(property.id);
		setShowMobileDetail(true);
	};

	const handleBack = () => {
		setShowMobileDetail(false);
	};

	const handleSave = async (id: string | null, name: string) => {
		if (id) {
			await updateProperty(id, name);
		} else {
			await createProperty(name);
		}
	};

	return (
		<>
			<div className="flex h-[calc(100vh-8rem)] -mx-4 sm:-mx-6 -mb-4 sm:-mb-6">
				{/* Sidebar */}
				<div
					className={`flex-1 lg:flex-none lg:w-80 shrink-0 border-r border-border bg-background flex-col ${
						showMobileDetail ? "hidden" : "flex"
					} lg:flex`}
				>
					<PropertySidebar
						properties={properties}
						selectedId={selectedPropertyId}
						onSelect={handleSelect}
						onAdd={() => setIsAdding(true)}
					/>
				</div>

				{/* Detail */}
				<div
					className={`flex-1 min-w-0 bg-card flex-col ${
						!selectedProperty || !showMobileDetail ? "hidden lg:flex" : "flex"
					}`}
				>
					{selectedProperty ? (
						<PropertyDetail
							property={selectedProperty}
							onEdit={setEditingProperty}
							onDelete={setDeletingProperty}
							onBack={handleBack}
						/>
					) : (
						<div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
							{t("selectPrompt")}
						</div>
					)}
				</div>
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
