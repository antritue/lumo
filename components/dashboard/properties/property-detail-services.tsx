"use client";

import { Info, Plus, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { formatServicePrice } from "@/lib/utils";
import { DeletePropertyServiceDialog } from "./delete-property-service-dialog";
import { usePropertyServicesStore } from "./property-services-store";
import type { PropertyService } from "./types";
import { UpsertPropertyServiceDialog } from "./upsert-property-service-dialog";

const EMPTY_SERVICES: PropertyService[] = [];

const PRESETS = {
	electricity: {
		names: { en: "Electricity", vi: "Điện" },
		unitLabel: "kWh",
		pricingType: "variable" as const,
	},
	water: {
		names: { en: "Water", vi: "Nước" },
		unitLabel: "m³",
		pricingType: "variable" as const,
	},
	wifi: {
		names: { en: "WiFi", vi: "WiFi" },
		unitLabel: null,
		pricingType: "flat" as const,
	},
	cleaning: {
		names: { en: "Cleaning", vi: "Vệ sinh" },
		unitLabel: null,
		pricingType: "flat" as const,
	},
	parking: {
		names: { en: "Parking", vi: "Giữ xe" },
		unitLabel: null,
		pricingType: "flat" as const,
	},
};

const PRESET_KEYS = Object.keys(PRESETS) as Array<keyof typeof PRESETS>;

interface PropertyDetailServicesProps {
	propertyId: string;
}

export function PropertyDetailServices({
	propertyId,
}: PropertyDetailServicesProps) {
	const t = useTranslations("app.propertyServices");
	const ts = useTranslations("app.services");
	const locale = useLocale() as "en" | "vi";

	const propertyServices = usePropertyServicesStore(
		(state) => state.propertyServicesByPropertyId[propertyId] ?? EMPTY_SERVICES,
	);
	const fetchPropertyServices = usePropertyServicesStore(
		(state) => state.fetchPropertyServices,
	);
	const addPropertyService = usePropertyServicesStore(
		(state) => state.addPropertyService,
	);
	const updatePropertyService = usePropertyServicesStore(
		(state) => state.updatePropertyService,
	);
	const deletePropertyService = usePropertyServicesStore(
		(state) => state.deletePropertyService,
	);

	const isPropertyServicesLoading = usePropertyServicesStore(
		(state) => state.fetchingPropertyId === propertyId,
	);
	const isPropertyServicesFetchFailed = usePropertyServicesStore(
		(state) => state.isPropertyServicesFetchFailed,
	);
	const isReady = !isPropertyServicesLoading && !isPropertyServicesFetchFailed;

	const existingPresetKeys = useMemo(() => {
		const storedNames = new Set(
			propertyServices.map((propertyService) =>
				propertyService.serviceName.toLowerCase(),
			),
		);
		return PRESET_KEYS.filter((key) => {
			const allNames = Object.values(PRESETS[key].names).map((n) =>
				n.toLowerCase(),
			);
			return !allNames.some((name) => storedNames.has(name));
		});
	}, [propertyServices]);

	const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
	const [editingService, setEditingService] = useState<PropertyService | null>(
		null,
	);
	const [presetToAdd, setPresetToAdd] = useState<keyof typeof PRESETS | null>(
		null,
	);
	const [deletingService, setDeletingService] =
		useState<PropertyService | null>(null);

	useEffect(() => {
		fetchPropertyServices(propertyId);
	}, [propertyId, fetchPropertyServices]);

	const getPresetService = (): PropertyService | undefined => {
		if (dialogMode !== "add" || !presetToAdd) return undefined;
		const defaults = PRESETS[presetToAdd];
		return {
			id: "",
			propertyId,
			serviceName: PRESETS[presetToAdd].names[locale],
			unitLabel: defaults.unitLabel,
			pricingType: defaults.pricingType,
			flatAmount: null,
			unitPrice: null,
		};
	};

	const handleUpsertService = async (
		id: string | null,
		serviceName: string,
		unitLabel: string | null,
		pricingType: "flat" | "variable",
		flatAmount: number | null,
		unitPrice: number | null,
	) => {
		if (id) {
			await updatePropertyService(propertyId, id, {
				serviceName,
				unitLabel,
				pricingType,
				flatAmount,
				unitPrice,
			});
		} else {
			await addPropertyService(propertyId, {
				serviceName,
				unitLabel,
				pricingType,
				flatAmount,
				unitPrice,
			});
		}
		setDialogMode(null);
		setPresetToAdd(null);
	};

	const formatPrice = (service: PropertyService): string =>
		formatServicePrice(service, locale, ts("perMonth"), ts("unit"));

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<h3 className="text-sm font-medium text-foreground">{t("title")}</h3>
				<div className="flex items-center justify-center rounded-full bg-primary h-5 px-2 text-xs font-medium text-primary-foreground">
					{propertyServices.length}
				</div>
				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="flex items-center justify-center h-4 w-4 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
							aria-label={t("infoButtonLabel")}
						>
							<Info className="h-3.5 w-3.5" />
						</button>
					</PopoverTrigger>
					<PopoverContent
						side="top"
						align="start"
						className="max-w-64 text-xs leading-relaxed"
					>
						<p>{t("titleTooltip")}</p>
					</PopoverContent>
				</Popover>
				<div className="flex-1" />
				<button
					type="button"
					onClick={() => setDialogMode("add")}
					className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
					aria-label={t("addService")}
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			{isPropertyServicesLoading && (
				<div className="flex flex-wrap gap-2">
					{["s-sk-0", "s-sk-1", "s-sk-2"].map((key) => (
						<Skeleton key={key} className="h-8 w-20 rounded-full" />
					))}
				</div>
			)}

			{isPropertyServicesFetchFailed && (
				<ErrorState onRetry={() => fetchPropertyServices(propertyId)} />
			)}

			{isReady && propertyServices.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{propertyServices.map((propertyService) => (
						<div
							key={propertyService.id}
							className="inline-flex items-stretch rounded-xl bg-secondary text-sm font-medium overflow-hidden"
						>
							<button
								type="button"
								onClick={() => {
									setEditingService(propertyService);
									setDialogMode("edit");
								}}
								className="flex flex-col items-start justify-center gap-0.5 pl-3 pr-1.5 py-1.5 hover:bg-muted transition-colors cursor-pointer min-w-0"
							>
								<span className="truncate max-w-[140px] leading-tight">
									{propertyService.serviceName}
								</span>
								{formatPrice(propertyService) && (
									<span className="text-xs font-normal text-muted-foreground whitespace-nowrap leading-tight">
										{formatPrice(propertyService)}
									</span>
								)}
							</button>
							<div className="w-px self-stretch bg-border/50" />
							<button
								type="button"
								onClick={() => setDeletingService(propertyService)}
								className="flex items-center justify-center pr-2 pl-1.5 py-1.5 hover:bg-muted hover:text-red-500 transition-colors cursor-pointer"
								aria-label={`${t("remove")} ${propertyService.serviceName}`}
							>
								<X className="h-3 w-3" />
							</button>
						</div>
					))}
				</div>
			)}

			{isReady && existingPresetKeys.length > 0 && (
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-sm text-muted-foreground shrink-0">
						{t("quickAddPresets")}
					</span>
					{existingPresetKeys.map((presetKey) => (
						<button
							key={presetKey}
							type="button"
							onClick={() => {
								setPresetToAdd(presetKey);
								setDialogMode("add");
							}}
							className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
						>
							{PRESETS[presetKey].names[locale]}
						</button>
					))}
				</div>
			)}

			<UpsertPropertyServiceDialog
				mode={dialogMode === "edit" ? "edit" : "add"}
				service={
					dialogMode === "edit" && editingService
						? editingService
						: getPresetService()
				}
				open={dialogMode !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDialogMode(null);
						setEditingService(null);
						setPresetToAdd(null);
					}
				}}
				onSave={handleUpsertService}
			/>

			<DeletePropertyServiceDialog
				service={deletingService}
				open={!!deletingService}
				onOpenChange={(open) => !open && setDeletingService(null)}
				onDelete={async (serviceId) => {
					await deletePropertyService(propertyId, serviceId);
					setDeletingService(null);
				}}
			/>
		</div>
	);
}
