"use client";

import { Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreatePropertyForm } from "./create-property-form";

interface EmptyStateProps {
	onCreateProperty: (name: string) => void;
}

export function EmptyState({ onCreateProperty }: EmptyStateProps) {
	const t = useTranslations("app.properties");

	return (
		<div className="flex flex-col items-center justify-center py-16 sm:py-24">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 mb-6">
				<Home className="h-10 w-10 text-muted-foreground" />
			</div>
			<h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
				{t("emptyTitle")}
			</h1>
			<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
				{t("emptySubtitle")}
			</p>

			<div className="w-full max-w-md">
				<CreatePropertyForm onSubmit={onCreateProperty} />
			</div>
		</div>
	);
}
