"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
	onRetry?: () => void | Promise<void>;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
	const t = useTranslations("app.shared.errorState");

	return (
		<div className="flex flex-col items-center justify-center py-12 px-4">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
				<AlertTriangle className="h-10 w-10 text-destructive" />
			</div>
			<h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2 text-center">
				{t("title")}
			</h2>
			<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-lg">
				{t("description")}
			</p>

			{onRetry && (
				<Button onClick={onRetry} size="lg" className="px-8">
					{t("retry")}
				</Button>
			)}
		</div>
	);
}
