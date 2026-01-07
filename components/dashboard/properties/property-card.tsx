"use client";

import { Home, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "./types";

interface PropertyCardProps {
	property: Property;
	onEdit?: (property: Property) => void;
	onDelete?: (property: Property) => void;
}

export function PropertyCard({
	property,
	onEdit,
	onDelete,
}: PropertyCardProps) {
	const t = useTranslations("app.properties");

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEdit?.(property);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete?.(property);
	};

	return (
		<Card className="hover:shadow-soft-lg transition-shadow">
			<CardHeader>
				<div className="flex items-center justify-between gap-3">
					<CardTitle className="flex items-center gap-3 flex-1">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
							<Home className="h-5 w-5 text-muted-foreground" />
						</div>
						{property.name}
					</CardTitle>

					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleEdit}
							aria-label={t("edit")}
							className="h-9 w-9"
						>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleDelete}
							aria-label={t("delete")}
							className="h-9 w-9 text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
