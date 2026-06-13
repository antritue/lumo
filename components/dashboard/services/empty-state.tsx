"use client";

import { Blocks, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useServicesStore } from "./store";
import { UpsertServiceDialog } from "./upsert-service-dialog";

export function EmptyState() {
	const t = useTranslations("app.services");
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
