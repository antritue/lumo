"use client";

import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Service } from "./types";
import { getServiceIcon } from "./types";

interface ServiceItemProps {
	service: Service;
	onEdit?: (service: Service) => void;
	onDelete?: (service: Service) => void;
}

export function ServiceItem({ service, onEdit, onDelete }: ServiceItemProps) {
	const t = useTranslations("app.services");
	const Icon = getServiceIcon(service.name);
	const [isExpanded, setIsExpanded] = useState(false);

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onEdit?.(service);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onDelete?.(service);
	};

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-3">
					<button
						type="button"
						onClick={toggleExpanded}
						className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
						aria-expanded={isExpanded}
					>
						{isExpanded ? (
							<ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
						) : (
							<ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
						)}
						<div className="flex items-center justify-center rounded-full bg-secondary p-2 sm:p-2.5 shrink-0">
							<Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
						</div>
						<CardTitle className="flex-1 min-w-0">
							<span className="text-lg sm:text-xl leading-tight wrap-anywhere">
								{service.name}
							</span>
						</CardTitle>
					</button>

					<div className="flex items-center gap-2 shrink-0">
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

			{isExpanded && (
				<CardContent className="pt-0 pb-4 px-6">
					<div className="space-y-1.5 text-sm">
						{service.unitLabel && (
							<div className="flex gap-2">
								<span className="text-muted-foreground">{t("unitLabel")}:</span>
								<span className="font-semibold text-foreground">
									{service.unitLabel}
								</span>
							</div>
						)}
						<div className="flex gap-2">
							<span className="text-muted-foreground">{t("pricingType")}:</span>
							<span className="font-semibold text-foreground">
								{service.pricingType === "flat" ? t("flat") : t("variable")}
							</span>
						</div>
						<div className="flex gap-2">
							<span className="text-muted-foreground">
								{service.pricingType === "flat"
									? t("flatAmount")
									: t("unitPrice")}
								:
							</span>
							<span className="font-semibold text-foreground">
								{service.pricingType === "flat"
									? service.flatAmount
										? `$${service.flatAmount}`
										: t("notSet")
									: service.unitPrice
										? `$${service.unitPrice} / ${service.unitLabel ?? t("unit")}`
										: t("notSet")}
							</span>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
}
