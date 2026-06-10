"use client";

import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { type SubmitEvent, useState } from "react";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreatePropertyFormProps {
	onSubmit: (name: string) => Promise<void> | void;
	onCancel?: () => void;
	showCancel?: boolean;
}

export function CreatePropertyForm({
	onSubmit,
	onCancel,
	showCancel = false,
}: CreatePropertyFormProps) {
	const t = useTranslations("app.properties");
	const [propertyName, setPropertyName] = useState("");

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();

		const trimmedName = propertyName.trim();

		if (!trimmedName) return;

		setIsSubmitting(true);

		try {
			await onSubmit(trimmedName);
			setPropertyName("");
		} catch {
			setErrorMessage(t("errors.create.description"));
			setErrorOpen(true);
			setIsSubmitting(false);
		}
	};

	if (isSubmitting) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2
					className="h-6 w-6 animate-spin text-muted-foreground"
					data-testid="property-create-loader"
				/>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				type="text"
				value={propertyName}
				onChange={(e) => setPropertyName(e.target.value)}
				placeholder={t("inputPlaceholder")}
				className="text-base h-12"
				autoFocus
			/>
			<div className={showCancel ? "flex gap-3" : ""}>
				<Button
					type="submit"
					size="lg"
					className={showCancel ? "flex-1" : "w-full"}
					disabled={!propertyName.trim()}
				>
					<Plus className="mr-2" />
					{t("addButton")}
				</Button>
				{showCancel && onCancel && (
					<Button type="button" variant="outline" size="lg" onClick={onCancel}>
						{t("cancel")}
					</Button>
				)}
			</div>
			<ErrorDialog
				open={errorOpen}
				onOpenChange={setErrorOpen}
				title={t("errors.create.title")}
				description={errorMessage}
			/>
		</form>
	);
}
