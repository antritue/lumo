"use client";

import { Info, Loader2, RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomServicesStore } from "./room-services-store";
import type { EffectiveRoomService } from "./types";

const EMPTY_EFFECTIVE_SERVICES: EffectiveRoomService[] = [];

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
		(state) => state.roomServicesByRoomId[roomId] ?? EMPTY_EFFECTIVE_SERVICES,
	);
	const fetchRoomServices = useRoomServicesStore(
		(state) => state.fetchRoomServices,
	);
	const toggleService = useRoomServicesStore((state) => state.toggleService);
	const setCustomPrice = useRoomServicesStore((state) => state.setCustomPrice);
	const resetToDefault = useRoomServicesStore((state) => state.resetToDefault);

	const isRoomServicesLoading = useRoomServicesStore(
		(state) => state.fetchingRoomId === roomId,
	);
	const isRoomServicesFetchFailed = useRoomServicesStore(
		(state) => state.isRoomServicesFetchFailed,
	);

	const [togglingServiceId, setTogglingServiceId] = useState<string | null>(
		null,
	);
	const [resettingServiceId, setResettingServiceId] = useState<string | null>(
		null,
	);
	const [editingService, setEditingService] =
		useState<EffectiveRoomService | null>(null);
	const [editAmount, setEditAmount] = useState("");
	const [savingEdit, setSavingEdit] = useState(false);

	useEffect(() => {
		fetchRoomServices(roomId, propertyId);
	}, [roomId, propertyId, fetchRoomServices]);

	const handleToggle = async (service: EffectiveRoomService) => {
		setTogglingServiceId(service.propertyServiceId);
		try {
			await toggleService(
				roomId,
				service.propertyServiceId,
				!service.isEnabled,
			);
		} finally {
			setTogglingServiceId(null);
		}
	};

	const handleReset = async (service: EffectiveRoomService) => {
		setResettingServiceId(service.propertyServiceId);
		try {
			await resetToDefault(roomId, service.propertyServiceId);
		} finally {
			setResettingServiceId(null);
		}
	};

	const handleRetry = () => {
		fetchRoomServices(roomId, propertyId);
	};

	const openEditDialog = (service: EffectiveRoomService) => {
		setEditingService(service);
		setEditAmount(
			service.pricingType === "flat"
				? (service.flatAmount?.toString() ?? "")
				: (service.unitPrice?.toString() ?? ""),
		);
	};

	const handleSaveEdit = async () => {
		if (!editingService) return;
		setSavingEdit(true);
		try {
			const parsedAmount = editAmount ? Number.parseFloat(editAmount) : null;
			await setCustomPrice(
				roomId,
				editingService.propertyServiceId,
				editingService.pricingType === "flat" ? parsedAmount : null,
				editingService.pricingType === "variable" ? parsedAmount : null,
			);
			setEditingService(null);
		} finally {
			setSavingEdit(false);
		}
	};

	const formatAmount = (service: EffectiveRoomService): string => {
		const currency = locale === "vi" ? "VND" : "USD";
		if (service.pricingType === "flat" && service.flatAmount != null) {
			return `${new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0 }).format(service.flatAmount)}${ts("perMonth")}`;
		}
		if (service.pricingType === "variable" && service.unitPrice != null) {
			return `${new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 0 }).format(service.unitPrice)}/${service.unitLabel ?? ts("unit")}`;
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
						<p>
							<span className="font-medium">{t("inheritedLabel")}</span>{" "}
							{t("inheritedTooltip")}
						</p>
						<p>
							<span className="font-medium">{t("customLabel")}</span>{" "}
							{t("customTooltip")}
						</p>
					</PopoverContent>
				</Popover>
			</div>

			{isRoomServicesLoading && (
				<div className="flex flex-wrap gap-2">
					{["rs-sk-0", "rs-sk-1", "rs-sk-2"].map((key) => (
						<Skeleton key={key} className="h-8 w-20 rounded-full" />
					))}
				</div>
			)}

			{isRoomServicesFetchFailed && !isRoomServicesLoading && (
				<div className="flex items-center gap-2">
					<span className="text-sm text-destructive">{t("fetchError")}</span>
					<button
						type="button"
						onClick={handleRetry}
						className="text-sm text-foreground underline underline-offset-2 hover:no-underline cursor-pointer"
					>
						{t("retry")}
					</button>
				</div>
			)}

			{!isRoomServicesLoading &&
				!isRoomServicesFetchFailed &&
				roomServices.length > 0 && (
					<div className="flex flex-wrap gap-2">
						{roomServices.map((service) => (
							<Popover
								key={service.propertyServiceId}
								open={
									editingService?.propertyServiceId ===
									service.propertyServiceId
								}
								onOpenChange={(open) => {
									if (!open) setEditingService(null);
								}}
							>
								<PopoverTrigger asChild>
									<div
										className={`inline-flex items-stretch rounded-full text-sm font-medium overflow-hidden ${
											service.isEnabled
												? "bg-secondary"
												: "bg-secondary/50 opacity-60"
										}`}
									>
										<button
											type="button"
											onClick={() => openEditDialog(service)}
											className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 hover:bg-muted transition-colors cursor-pointer text-left min-w-0"
										>
											<span className="truncate max-w-[120px]">
												{service.serviceName}
											</span>
											{service.isOverridden && (
												<span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
											)}
											{!service.isEnabled && (
												<span className="text-[10px] text-muted-foreground">
													/off
												</span>
											)}
										</button>
										<div className="w-px self-stretch bg-border/50" />
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleToggle(service);
											}}
											disabled={togglingServiceId === service.propertyServiceId}
											className="flex items-center justify-center px-2 py-1.5 hover:bg-muted transition-colors cursor-pointer disabled:opacity-40 text-xs text-muted-foreground"
											aria-label={
												service.isEnabled
													? `${t("disable")} ${service.serviceName}`
													: `${t("enable")} ${service.serviceName}`
											}
										>
											{togglingServiceId === service.propertyServiceId ? (
												<Loader2 className="h-3 w-3 animate-spin" />
											) : service.isEnabled ? (
												t("disable")
											) : (
												t("enable")
											)}
										</button>
										{service.isOverridden && (
											<>
												<div className="w-px self-stretch bg-border/50" />
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														handleReset(service);
													}}
													disabled={
														resettingServiceId === service.propertyServiceId
													}
													className="flex items-center justify-center px-2 py-1.5 hover:bg-muted transition-colors cursor-pointer disabled:opacity-40 text-muted-foreground"
													aria-label={`${t("resetToDefault")} ${service.serviceName}`}
												>
													{resettingServiceId === service.propertyServiceId ? (
														<Loader2 className="h-3 w-3 animate-spin" />
													) : (
														<RotateCcw className="h-3 w-3" />
													)}
												</button>
											</>
										)}
									</div>
								</PopoverTrigger>
								<PopoverContent
									align="start"
									className="w-64 p-3"
									sideOffset={4}
								>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">
												{service.serviceName}
											</span>
											{service.isOverridden ? (
												<span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
													{t("customLabel")}
												</span>
											) : (
												<span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
													{t("inheritedLabel")}
												</span>
											)}
										</div>
										<div className="space-y-1.5">
											<label
												htmlFor={`edit-amount-${service.propertyServiceId}`}
												className="text-xs text-muted-foreground"
											>
												{service.pricingType === "flat"
													? ts("flatAmount")
													: ts("unitPrice")}
											</label>
											<input
												id={`edit-amount-${service.propertyServiceId}`}
												type="number"
												value={editAmount}
												onChange={(e) => setEditAmount(e.target.value)}
												className="w-full h-8 px-2 text-sm rounded-md border border-input bg-background"
												min="0"
												step="0.01"
											/>
										</div>
										<div className="flex gap-2">
											<Button
												size="sm"
												className="flex-1 h-8"
												disabled={savingEdit}
												onClick={handleSaveEdit}
											>
												{savingEdit ? (
													<Loader2 className="h-3 w-3 animate-spin" />
												) : (
													ts("saveButton")
												)}
											</Button>
											<Button
												size="sm"
												variant="ghost"
												className="h-8"
												onClick={() => setEditingService(null)}
											>
												{ts("cancel")}
											</Button>
										</div>
										<p className="text-[11px] text-muted-foreground">
											{formatAmount(service)}
										</p>
									</div>
								</PopoverContent>
							</Popover>
						))}
					</div>
				)}

			{!isRoomServicesLoading &&
				!isRoomServicesFetchFailed &&
				roomServices.length === 0 && (
					<p className="text-sm text-muted-foreground">{t("empty")}</p>
				)}
		</div>
	);
}
