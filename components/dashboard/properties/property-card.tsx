"use client";

import { ChevronDown, ChevronRight, Home, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { RoomList } from "@/components/dashboard/rooms/room-list";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	const [isExpanded, setIsExpanded] = useState(true);

	const allRooms = useRoomsStore((state) => state.rooms);
	const rooms = allRooms.filter((room) => room.propertyId === property.id);

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onEdit?.(property);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onDelete?.(property);
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
							<ChevronDown className="h-5 w-5 text-muted-foreground" />
						) : (
							<ChevronRight className="h-5 w-5 text-muted-foreground" />
						)}
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
							<Home className="h-5 w-5 text-muted-foreground" />
						</div>
						<CardTitle className="flex-1 min-w-0">
							<div className="flex items-baseline gap-2 flex-wrap">
								<span>{property.name}</span>
								<span className="text-sm font-normal text-muted-foreground">
									{t("roomCount", { count: rooms.length })}
								</span>
							</div>
						</CardTitle>
					</button>

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

			{isExpanded && (
				<CardContent className="pt-0">
					<RoomList propertyId={property.id} rooms={rooms} />
				</CardContent>
			)}
		</Card>
	);
}
