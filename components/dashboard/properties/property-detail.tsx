"use client";

import { ChevronRight, Home, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useRoomsStore } from "../rooms/store";
import { PropertyDetailRooms } from "./property-detail-rooms";
import { usePropertyServicesStore } from "./property-services-store";
import type { Property } from "./types";

interface PropertyDetailProps {
	property: Property;
	onEdit: (property: Property) => void;
	onDelete: (property: Property) => void;
	onBack?: () => void;
	className?: string;
}

export function PropertyDetail({
	property,
	onEdit,
	onDelete,
	onBack,
	className,
}: PropertyDetailProps) {
	const t = useTranslations("app.properties");
	const rt = useTranslations("app.rooms");
	const pst = useTranslations("app.propertyServices");
	const rooms = useRoomsStore((state) => state.rooms);
	const fetchRoomsByPropertyId = useRoomsStore(
		(state) => state.fetchRoomsByPropertyId,
	);
	const propertyServices = usePropertyServicesStore(
		(state) => state.propertyServicesByPropertyId[property.id] ?? [],
	);
	const fetchPropertyServices = usePropertyServicesStore(
		(state) => state.fetchPropertyServices,
	);

	const roomCount = useMemo(
		() => rooms.filter((r) => r.propertyId === property.id).length,
		[rooms, property.id],
	);
	const serviceCount = propertyServices.length;

	useEffect(() => {
		fetchRoomsByPropertyId(property.id);
		fetchPropertyServices(property.id);
	}, [property.id, fetchRoomsByPropertyId, fetchPropertyServices]);

	return (
		<div
			className={cn(
				"flex flex-col flex-1 min-h-0 bg-card p-6 space-y-8",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-4 min-w-0">
					{onBack && (
						<button
							type="button"
							onClick={onBack}
							className="lg:hidden flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted transition-colors shrink-0"
							aria-label={t("backToProperties")}
						>
							<ChevronRight className="h-5 w-5 rotate-180" />
						</button>
					)}
					<div className="flex items-center justify-center rounded-xl bg-secondary p-3 shrink-0">
						<Home className="h-6 w-6 text-muted-foreground" />
					</div>
					<div className="min-w-0">
						<h2 className="text-xl font-semibold truncate">{property.name}</h2>
						<p className="text-sm text-muted-foreground mt-0.5">
							{rt("count", { count: roomCount })}
							{" · "}
							{pst("count", { count: serviceCount })}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1 shrink-0">
					<button
						type="button"
						onClick={() => onEdit(property)}
						className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors cursor-pointer"
						aria-label={t("edit")}
					>
						<Pencil className="h-4 w-4 text-muted-foreground" />
					</button>
					<button
						type="button"
						onClick={() => onDelete(property)}
						className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted transition-colors cursor-pointer"
						aria-label={t("delete")}
					>
						<Trash2 className="h-4 w-4 text-destructive" />
					</button>
				</div>
			</div>

			<PropertyDetailRooms propertyId={property.id} />
		</div>
	);
}
