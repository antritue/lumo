"use client";

import { Info, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import type { PropertyService } from "@/components/dashboard/properties/types";
import { DeleteServiceDialog } from "@/components/dashboard/services/delete-service-dialog";
import type { Service } from "@/components/dashboard/services/types";
import { UpsertServiceDialog } from "@/components/dashboard/services/upsert-service-dialog";
import { ErrorState } from "@/components/shared/error-state";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useRoomServicesStore } from "./room-services-store";
import type { RoomService } from "./types";

const EMPTY_ROOM_SERVICES: RoomService[] = [];
const EMPTY_PROPERTY_SERVICES: PropertyService[] = [];

interface RoomServicesSectionProps {
	roomId: string;
	propertyId: string;
}

export function RoomServicesSection({
	roomId,
	propertyId,
}: RoomServicesSectionProps) {
	const t = useTranslations("app.roomServices");
	const ts = useTranslations("app.services");
	const locale = useLocale();

	const roomServices = useRoomServicesStore(
		(state) => state.roomServicesByRoomId[roomId] ?? EMPTY_ROOM_SERVICES,
	);
	const fetchRoomServices = useRoomServicesStore(
		(state) => state.fetchRoomServices,
	);
	const addRoomService = useRoomServicesStore((state) => state.addRoomService);
	const updateRoomService = useRoomServicesStore(
		(state) => state.updateRoomService,
	);
	const deleteRoomService = useRoomServicesStore(
		(state) => state.deleteRoomService,
	);

	const isRoomServicesLoading = useRoomServicesStore(
		(state) => state.fetchingRoomId === roomId,
	);
	const isRoomServicesFetchFailed = useRoomServicesStore(
		(state) => state.isRoomServicesFetchFailed,
	);

	const propertyServices = usePropertyServicesStore(
		(state) =>
			state.propertyServicesByPropertyId[propertyId] ?? EMPTY_PROPERTY_SERVICES,
	);
	const isPropertyServicesLoading = usePropertyServicesStore(
		(state) => state.fetchingPropertyId === propertyId,
	);
	const fetchPropertyServices = usePropertyServicesStore(
		(state) => state.fetchPropertyServices,
	);

	const availableServices = useMemo(
		() =>
			propertyServices
				.filter(
					(propertyService) =>
						!roomServices.some(
							(roomService) =>
								roomService.serviceId === propertyService.serviceId,
						),
				)
				.map(
					(propertyService): Service => ({
						id: propertyService.serviceId,
						userId: "",
						name: propertyService.serviceName,
						unitLabel: propertyService.unitLabel,
						pricingType: propertyService.pricingType,
						flatAmount: propertyService.flatAmount,
						unitPrice: propertyService.unitPrice,
					}),
				),
		[propertyServices, roomServices],
	);

	const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
	const [editingService, setEditingService] = useState<Service | undefined>(
		undefined,
	);
	const [isEditingCustom, setIsEditingCustom] = useState(false);
	const [deletingService, setDeletingService] = useState<RoomService | null>(
		null,
	);
	const [activatingServiceId, setActivatingServiceId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		fetchRoomServices(roomId, propertyId);
	}, [roomId, propertyId, fetchRoomServices]);

	useEffect(() => {
		fetchPropertyServices(propertyId);
	}, [propertyId, fetchPropertyServices]);

	const findPropertyService = (roomService: RoomService) =>
		propertyServices.find((p) => p.serviceId === roomService.serviceId);

	const isRoomServiceCustom = (roomService: RoomService) => {
		if (isPropertyServicesLoading) return false;
		const propertyService = findPropertyService(roomService);
		if (!propertyService) return true;
		return (
			roomService.serviceName !== propertyService.serviceName ||
			roomService.unitLabel !== propertyService.unitLabel ||
			roomService.pricingType !== propertyService.pricingType ||
			roomService.flatAmount !== propertyService.flatAmount ||
			roomService.unitPrice !== propertyService.unitPrice
		);
	};

	const resolveService = (roomService: RoomService): Service => {
		const propertyService = findPropertyService(roomService);
		return {
			id: roomService.serviceId,
			userId: "",
			name: roomService.serviceName,
			unitLabel: roomService.unitLabel ?? propertyService?.unitLabel ?? null,
			pricingType: roomService.pricingType,
			flatAmount: roomService.flatAmount ?? propertyService?.flatAmount ?? null,
			unitPrice: roomService.unitPrice ?? propertyService?.unitPrice ?? null,
		};
	};

	const handleEditService = (roomService: RoomService) => {
		setEditingService(resolveService(roomService));
		setIsEditingCustom(isRoomServiceCustom(roomService));
		setDialogMode("edit");
	};

	const handleSave = async (
		id: string | null,
		name: string,
		unitLabel: string | null,
		pricingType: "flat" | "variable",
		flatAmount: number | null,
		unitPrice: number | null,
	) => {
		if (id) {
			await updateRoomService(roomId, id, {
				serviceName: name,
				unitLabel,
				pricingType,
				flatAmount,
				unitPrice,
			});
		} else {
			const newId = crypto.randomUUID();
			await addRoomService(roomId, newId, {
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
		await deleteRoomService(roomId, serviceId);
		setDeletingService(null);
	};

	const handleRetry = () => {
		fetchRoomServices(roomId, propertyId);
	};

	const handleActivateProperty = async (service: Service) => {
		setActivatingServiceId(service.id);
		try {
			await addRoomService(roomId, service.id, {
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

	const formatAmount = (roomService: RoomService): string => {
		const propertyService = findPropertyService(roomService);
		const flatAmount =
			roomService.flatAmount ?? propertyService?.flatAmount ?? null;
		const unitPrice =
			roomService.unitPrice ?? propertyService?.unitPrice ?? null;
		const unitLabel =
			roomService.unitLabel ?? propertyService?.unitLabel ?? null;
		const currency = locale === "vi" ? "VND" : "USD";
		if (roomService.pricingType === "flat" && flatAmount != null) {
			return `${new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0 }).format(flatAmount)}${ts("perMonth")}`;
		}
		if (roomService.pricingType === "variable" && unitPrice != null) {
			return `${new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0 }).format(unitPrice)}/${unitLabel ?? ts("unit")}`;
		}
		return "";
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<h3 className="text-sm font-medium text-foreground">{t("title")}</h3>
				<div className="flex items-center justify-center rounded-full bg-primary h-5 px-2 text-xs font-medium text-primary-foreground">
					{roomServices.length}
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
							{t("roomTipBefore")}
							<Link
								href="/dashboard/services"
								className="underline underline-offset-2 hover:text-foreground transition-colors"
							>
								{t("title")}
							</Link>
							{t("roomTipAfter")}
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

			{isRoomServicesLoading && (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			)}

			{isRoomServicesFetchFailed && !isRoomServicesLoading && (
				<ErrorState onRetry={handleRetry} />
			)}

			{!isRoomServicesLoading &&
				!isRoomServicesFetchFailed &&
				roomServices.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{roomServices.map((roomService) => (
							<div
								key={roomService.id}
								className="inline-flex items-stretch rounded-2xl bg-secondary text-sm font-medium overflow-hidden hover:bg-muted transition-colors"
							>
								<button
									type="button"
									onClick={() => handleEditService(roomService)}
									className="flex flex-col py-1.5 pl-3 pr-1.5 min-w-0 cursor-pointer text-left"
								>
									<div className="flex items-center gap-1">
										<span className="font-medium">
											{roomService.serviceName}
										</span>
										{isRoomServiceCustom(roomService) && (
											<span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
										)}
									</div>
									<span className="text-xs text-muted-foreground">
										{roomService.pricingType === "flat"
											? `${ts("flat")} · ${formatAmount(roomService)}`
											: `${ts("variable")} · ${formatAmount(roomService)}`}
									</span>
								</button>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setDeletingService(roomService);
									}}
									className="flex items-center justify-center pr-2 pl-0.5 hover:text-red-500 transition-colors cursor-pointer shrink-0"
									aria-label={`${t("remove")} ${roomService.serviceName}`}
								>
									<X className="h-3 w-3" />
								</button>
							</div>
						))}
					</div>
				)}

			{!isRoomServicesLoading &&
				!isRoomServicesFetchFailed &&
				roomServices.length === 0 && (
					<p className="text-sm text-muted-foreground">{t("empty")}</p>
				)}

			{!isRoomServicesLoading &&
				!isRoomServicesFetchFailed &&
				availableServices.length > 0 && (
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-xs text-muted-foreground shrink-0">
							{t("quickAddFromProperty")}
						</span>
						{availableServices.map((service) => (
							<button
								key={service.id}
								type="button"
								disabled={activatingServiceId === service.id}
								onClick={() => handleActivateProperty(service)}
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
				onSave={handleSave}
			/>

			<DeleteServiceDialog
				service={
					deletingService
						? {
								id: deletingService.serviceId,
								userId: "",
								name: deletingService.serviceName,
								unitLabel: deletingService.unitLabel,
								pricingType: deletingService.pricingType,
								flatAmount: deletingService.flatAmount,
								unitPrice: deletingService.unitPrice,
							}
						: null
				}
				open={!!deletingService}
				onOpenChange={(open) => !open && setDeletingService(null)}
				onDelete={handleDeleteService}
			/>
		</div>
	);
}
