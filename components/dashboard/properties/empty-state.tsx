"use client";

import { Home, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePropertiesStore } from "./store";
import { UpsertPropertyDialog } from "./upsert-property-dialog";

export function EmptyState() {
	const t = useTranslations("app.properties");
	const createProperty = usePropertiesStore((state) => state.createProperty);
	const [isAdding, setIsAdding] = useState(false);

	const handleSave = async (_id: string | null, name: string) => {
		await createProperty(name);
	};

	return (
		<>
			<div className="flex flex-col items-center justify-center py-16 sm:py-20">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50">
					<Home className="h-10 w-10 text-muted-foreground" />
				</div>
				<h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
					{t("emptyTitle")}
				</h2>
				<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
					{t("emptySubtitle")}
				</p>

				<Button onClick={() => setIsAdding(true)} size="lg">
					<Plus className="mr-2" />
					{t("addButton")}
				</Button>
			</div>

			<UpsertPropertyDialog
				mode="add"
				open={isAdding}
				onOpenChange={setIsAdding}
				onSave={handleSave}
			/>
		</>
	);
}
