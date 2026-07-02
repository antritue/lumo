"use client";

import { Info, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { DeleteServiceDialog } from "@/components/dashboard/services/delete-service-dialog";
import { useServicesStore } from "@/components/dashboard/services/store";
import type { Service } from "@/components/dashboard/services/types";
import { UpsertServiceDialog } from "@/components/dashboard/services/upsert-service-dialog";
import { ErrorState } from "@/components/shared/error-state";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { usePropertyServicesStore } from "./property-services-store";
import type { PropertyService } from "./types";

const EMPTY_SERVICES: PropertyService[] = [];

interface PropertyDetailServicesProps {
	propertyId: string;
}

export function PropertyDetailServices({
	propertyId,
}: PropertyDetailServicesProps) {
	const t = useTranslations("app.propertyServices");

	const services = useServicesStore((state) => state.services);
	const fetchServices = useServicesStore((state) => state.fetchServices);

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
	const serviceCount = propertyServices.length;

	const availableServices = useMemo(
		() =>
			services.filter(
				(service) =>
					!propertyServices.some(
						(propertyService) => propertyService.serviceId === service.id,
					),
			),
		[services, propertyServices],
	);

	const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
	const [editingService, setEditingService] = useState<Service | undefined>(
		undefined,
	);
	const [isEditingCustom, setIsEditingCustom] = useState(false);
	const [deletingService, setDeletingService] = useState<Service | null>(null);
	const [activatingServiceId, setActivatingServiceId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		fetchServices();
		fetchPropertyServices(propertyId);
	}, [propertyId, fetchServices, fetchPropertyServices]);

	const serviceNameMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const service of services) {
			map.set(service.id, service.name);
		}
		return map;
	}, [services]);

	const getServiceName = (propertyService: PropertyService): string =>
		propertyService.serviceName ||
		serviceNameMap.get(propertyService.serviceId) ||
		"Unknown";

	const isServiceCustom = (propertyService: PropertyService) => {
		const global = services.find(
			(service) => service.id === propertyService.serviceId,
		);
		if (!global) return true;
		return (
			propertyService.serviceName !== global.name ||
			propertyService.unitLabel !== global.unitLabel ||
			propertyService.pricingType !== global.pricingType ||
			propertyService.flatAmount !== global.flatAmount ||
			propertyService.unitPrice !== global.unitPrice
		);
	};

	const resolveService = (propertyService: PropertyService): Service => {
		const global = services.find(
			(service) => service.id === propertyService.serviceId,
		);
		if (!global) {
			return {
				id: propertyService.serviceId,
				userId: "",
				name: getServiceName(propertyService),
				unitLabel: propertyService.unitLabel ?? null,
				pricingType: propertyService.pricingType ?? "flat",
				flatAmount: propertyService.flatAmount,
				unitPrice: propertyService.unitPrice,
			};
		}
		return {
			...global,
			name: propertyService.serviceName || global.name,
			unitLabel: propertyService.unitLabel ?? global.unitLabel,
			pricingType: propertyService.pricingType,
			flatAmount: propertyService.flatAmount,
			unitPrice: propertyService.unitPrice,
		};
	};

	const handleUpsertService = async (
		id: string | null,
		name: string,
		unitLabel: string | null,
		pricingType: "flat" | "variable",
		flatAmount: number | null,
		unitPrice: number | null,
	) => {
		if (id) {
			await updatePropertyService(propertyId, id, {
				serviceName: name,
				unitLabel,
				pricingType,
				flatAmount,
				unitPrice,
			});
		} else {
			const newId = crypto.randomUUID();
			await addPropertyService(propertyId, newId, {
				serviceName: name,
				unitLabel,
				pricingType,
				flatAmount,
				unitPrice,
			});
		}
		setDialogMode(null);
	};

	const handleDeleteService = async (serviceId: string) => {
		await deletePropertyService(propertyId, serviceId);
		setDeletingService(null);
	};

	const handleRetry = () => {
		fetchServices();
		fetchPropertyServices(propertyId);
	};

	const handleActivateGlobal = async (service: Service) => {
		setActivatingServiceId(service.id);
		try {
			await addPropertyService(propertyId, service.id, {
				serviceName: service.name,
				unitLabel: service.unitLabel,
				pricingType: service.pricingType,
				flatAmount: service.flatAmount,
				unitPrice: service.unitPrice,
			});
		} finally {
			setActivatingServiceId(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<h3 className="text-sm font-medium text-foreground">{t("title")}</h3>
				<div className="flex items-center justify-center rounded-full bg-primary h-5 px-2 text-xs font-medium text-primary-foreground">
					{serviceCount}
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
						className="max-w-64 text-xs leading-relaxed space-y-2"
					>
						<p>{t("titleTooltip")}</p>
						<p className="flex items-center gap-1.5">
							<span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
							{t("customizedTooltip")}
						</p>
						<p>
							{t("globalTipBefore")}
							<Link
								href="/dashboard/services"
								className="underline underline-offset-2 hover:text-foreground transition-colors"
							>
								{t("title")}
							</Link>
							{t("globalTipAfter")}
						</p>
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

			{isPropertyServicesFetchFailed && !isPropertyServicesLoading && (
				<ErrorState onRetry={handleRetry} />
			)}

			{!isPropertyServicesLoading &&
				!isPropertyServicesFetchFailed &&
				propertyServices.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{propertyServices.map((propertyService) => (
							<div
								key={propertyService.id}
								className="inline-flex items-stretch rounded-full bg-secondary text-sm font-medium overflow-hidden"
							>
								<button
									type="button"
									onClick={() => {
										setEditingService(resolveService(propertyService));
										setIsEditingCustom(isServiceCustom(propertyService));
										setDialogMode("edit");
									}}
									className="flex items-center gap-1 pl-3 pr-1.5 py-1.5 hover:bg-muted transition-colors cursor-pointer"
								>
									{getServiceName(propertyService)}
									{isServiceCustom(propertyService) && (
										<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
									)}
								</button>
								<div className="w-px self-stretch bg-border/50" />
								<button
									type="button"
									onClick={() =>
										setDeletingService({
											id: propertyService.serviceId,
											userId: "",
											name: getServiceName(propertyService),
											unitLabel: propertyService.unitLabel ?? null,
											pricingType: propertyService.pricingType ?? "flat",
											flatAmount: propertyService.flatAmount,
											unitPrice: propertyService.unitPrice,
										})
									}
									className="flex items-center justify-center pr-2 pl-1.5 py-1.5 hover:bg-muted hover:text-red-500 transition-colors cursor-pointer"
									aria-label={`${t("remove")} ${getServiceName(propertyService)}`}
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
					</div>
				)}

			{!isPropertyServicesLoading &&
				!isPropertyServicesFetchFailed &&
				availableServices.length > 0 && (
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-sm text-muted-foreground shrink-0">
							{t("quickAddFromGlobal")}
						</span>
						{availableServices.map((service) => (
							<button
								key={service.id}
								type="button"
								disabled={activatingServiceId === service.id}
								onClick={() => handleActivateGlobal(service)}
								className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
							>
								{activatingServiceId === service.id ? (
									<Loader2 className="h-3 w-3 animate-spin" />
								) : null}
								{service.name}
							</button>
						))}
					</div>
				)}

			<UpsertServiceDialog
				mode={dialogMode === "edit" ? "edit" : "add"}
				service={dialogMode === "edit" ? editingService : undefined}
				customServiceNotice={
					dialogMode === "edit" && isEditingCustom
						? t("customServiceNotice")
						: undefined
				}
				open={dialogMode !== null}
				onOpenChange={(open) => !open && setDialogMode(null)}
				onSave={handleUpsertService}
			/>

			<DeleteServiceDialog
				service={deletingService}
				open={!!deletingService}
				onOpenChange={(open) => !open && setDeletingService(null)}
				onDelete={handleDeleteService}
			/>
		</div>
	);
}
