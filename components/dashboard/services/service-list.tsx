"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteServiceDialog } from "./delete-service-dialog";
import { ServiceItem } from "./service-item";
import { HINT_SERVICES, useServicesStore } from "./store";
import type { Service } from "./types";
import { getServiceIcon } from "./types";
import { UpsertServiceDialog } from "./upsert-service-dialog";

export function ServiceList() {
	const t = useTranslations("app.services");
	const services = useServicesStore((state) => state.services);
	const createService = useServicesStore((state) => state.createService);
	const updateService = useServicesStore((state) => state.updateService);
	const deleteService = useServicesStore((state) => state.deleteService);

	const [isAdding, setIsAdding] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [deletingService, setDeletingService] = useState<Service | null>(null);

	const handleSave = async (
		id: string | null,
		name: string,
		unitLabel: string | null,
		pricingType: "flat" | "variable",
		flatAmount: number | null,
		unitPrice: number | null,
	) => {
		if (id) {
			await updateService(
				id,
				name,
				unitLabel,
				pricingType,
				flatAmount,
				unitPrice,
			);
		} else {
			await createService(name, unitLabel, pricingType, flatAmount, unitPrice);
		}
	};

	const handleHintAdd = async (hintName: string) => {
		await createService(hintName, null, "flat", null, null);
	};

	const availableHints = HINT_SERVICES.filter(
		(hint) => !services.some((s) => s.name === hint),
	);

	return (
		<>
			<div className="space-y-6">
				<div className="grid gap-4">
					{services.map((service) => (
						<ServiceItem
							key={service.id}
							service={service}
							onEdit={setEditingService}
							onDelete={setDeletingService}
						/>
					))}
				</div>

				{/* Hint suggestions */}
				{availableHints.length > 0 && (
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground">{t("suggestions")}</p>
						<div className="flex flex-wrap gap-2">
							{availableHints.map((hint) => {
								const HintIcon = getServiceIcon(hint);
								return (
									<Button
										key={hint}
										variant="outline"
										size="sm"
										onClick={() => handleHintAdd(hint)}
									>
										<HintIcon className="mr-1.5 h-3.5 w-3.5" />
										{hint}
									</Button>
								);
							})}
						</div>
					</div>
				)}

				<Button onClick={() => setIsAdding(true)} size="lg" className="w-full">
					<Plus className="mr-2" />
					{t("addAnother")}
				</Button>
			</div>

			<UpsertServiceDialog
				mode="add"
				open={isAdding}
				onOpenChange={setIsAdding}
				onSave={handleSave}
			/>

			<UpsertServiceDialog
				mode="edit"
				service={editingService ?? undefined}
				open={!!editingService}
				onOpenChange={(open) => !open && setEditingService(null)}
				onSave={handleSave}
			/>

			<DeleteServiceDialog
				service={deletingService}
				open={!!deletingService}
				onOpenChange={(open) => !open && setDeletingService(null)}
				onDelete={deleteService}
			/>
		</>
	);
}
