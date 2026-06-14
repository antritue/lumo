"use client";

import { Blocks, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HINT_SERVICES, useServicesStore } from "./store";
import { getServiceIcon } from "./types";
import { UpsertServiceDialog } from "./upsert-service-dialog";

export function EmptyState() {
	const t = useTranslations("app.services");
	const services = useServicesStore((state) => state.services);
	const createService = useServicesStore((state) => state.createService);
	const [isAdding, setIsAdding] = useState(false);

	const handleSave = async (
		_id: string | null,
		name: string,
		unitLabel: string | null,
		pricingType: "flat" | "variable",
		flatAmount: number | null,
		unitPrice: number | null,
	) => {
		await createService(name, unitLabel, pricingType, flatAmount, unitPrice);
	};

	const handleHintAdd = async (hintName: string) => {
		await createService(hintName, null, "flat", null, null);
	};

	const availableHints = HINT_SERVICES.filter(
		(hint) => !services.some((s) => s.name === hint),
	);

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 mb-6">
				<Blocks className="h-10 w-10 text-muted-foreground" />
			</div>
			<h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
				{t("emptyTitle")}
			</h1>
			<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
				{t("emptySubtitle")}
			</p>

			{/* Quick add suggestions */}
			{availableHints.length > 0 && (
				<div className="space-y-3 mb-8">
					<p className="text-sm text-muted-foreground text-center">
						{t("suggestions")}
					</p>
					<div className="flex flex-wrap justify-center gap-2">
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

			<Button onClick={() => setIsAdding(true)} size="lg">
				<Plus className="mr-2" />
				{t("addButton")}
			</Button>

			<UpsertServiceDialog
				mode="add"
				open={isAdding}
				onOpenChange={setIsAdding}
				onSave={handleSave}
			/>
		</div>
	);
}
