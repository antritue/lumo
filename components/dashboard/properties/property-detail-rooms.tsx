"use client";

import {
	ChevronRight,
	DoorOpen,
	Loader2,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteRoomDialog } from "../rooms/delete-room-dialog";
import { useRoomsStore } from "../rooms/store";
import type { Room } from "../rooms/types";
import { UpsertRoomDialog } from "../rooms/upsert-room-dialog";

interface PropertyDetailRoomsProps {
	propertyId: string;
}

export function PropertyDetailRooms({ propertyId }: PropertyDetailRoomsProps) {
	const rt = useTranslations("app.rooms");
	const t = useTranslations("app.properties");
	const rooms = useRoomsStore((state) => state.rooms);
	const loadingPropertyIds = useRoomsStore((state) => state.loadingPropertyIds);
	const failedPropertyIds = useRoomsStore((state) => state.failedPropertyIds);
	const fetchRoomsByPropertyId = useRoomsStore(
		(state) => state.fetchRoomsByPropertyId,
	);
	const createRoom = useRoomsStore((state) => state.createRoom);
	const updateRoom = useRoomsStore((state) => state.updateRoom);
	const deleteRoom = useRoomsStore((state) => state.deleteRoom);

	const propertyRooms = useMemo(
		() => rooms.filter((r) => r.propertyId === propertyId),
		[rooms, propertyId],
	);
	const isRoomsLoading = loadingPropertyIds.includes(propertyId);
	const roomsFetchFailed = failedPropertyIds.includes(propertyId);
	const roomCount = propertyRooms.length;

	const [upsertRoom, setUpsertRoom] = useState<"add" | Room | null>(null);
	const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

	useEffect(() => {
		fetchRoomsByPropertyId(propertyId);
	}, [propertyId, fetchRoomsByPropertyId]);

	const handleUpsertRoom = async (
		id: string | null,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => {
		if (id) {
			await updateRoom(id, name, monthlyRent, notes);
		} else {
			await createRoom(propertyId, name, monthlyRent, notes);
		}
		setUpsertRoom(null);
	};

	const handleDeleteRoom = async (id: string) => {
		await deleteRoom(id);
		setDeletingRoom(null);
	};

	const handleRetry = () => {
		fetchRoomsByPropertyId(propertyId);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<h3 className="text-sm font-medium text-foreground">{rt("title")}</h3>
				<div className="flex items-center justify-center rounded-full bg-primary h-5 px-2 text-xs font-medium text-primary-foreground">
					{roomCount}
				</div>
				<div className="flex-1" />
				<button
					type="button"
					onClick={() => setUpsertRoom("add")}
					className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
					aria-label={rt("addButton")}
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			{isRoomsLoading && (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			)}

			{roomsFetchFailed && !isRoomsLoading && (
				<div className="flex items-center justify-center py-8">
					<Button variant="outline" size="sm" onClick={handleRetry}>
						Retry
					</Button>
				</div>
			)}

			{!isRoomsLoading && !roomsFetchFailed && (
				<>
					{propertyRooms.length > 0 && (
						<div className="space-y-1">
							{propertyRooms.map((room) => (
								<Link
									key={room.id}
									href={`/dashboard/rooms/${room.id}`}
									className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors group"
								>
									<div className="flex items-center justify-center rounded-lg bg-secondary p-2 shrink-0">
										<DoorOpen className="h-4 w-4 text-muted-foreground" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium truncate">{room.name}</p>
									</div>
									<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setUpsertRoom(room);
											}}
											className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors cursor-pointer"
											aria-label={t("edit")}
										>
											<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setDeletingRoom(room);
											}}
											className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors cursor-pointer"
											aria-label={t("delete")}
										>
											<Trash2 className="h-3.5 w-3.5 text-destructive" />
										</button>
									</div>
									<ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
								</Link>
							))}
						</div>
					)}

					{propertyRooms.length === 0 && (
						<div className="flex flex-col items-center justify-center py-12 rounded-xl border border-border bg-card">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-4">
								<DoorOpen className="h-6 w-6 text-muted-foreground" />
							</div>
							<p className="text-sm font-medium text-foreground mb-1">
								{rt("emptyTitle")}
							</p>
							<p className="text-sm text-muted-foreground">
								{rt("emptySubtitle")}
							</p>
						</div>
					)}
				</>
			)}

			<UpsertRoomDialog
				mode={typeof upsertRoom === "string" ? "add" : "edit"}
				room={
					upsertRoom && typeof upsertRoom === "object" ? upsertRoom : undefined
				}
				open={upsertRoom !== null}
				onOpenChange={(open) => !open && setUpsertRoom(null)}
				onSave={handleUpsertRoom}
			/>

			<DeleteRoomDialog
				room={deletingRoom}
				open={!!deletingRoom}
				onOpenChange={(open) => !open && setDeletingRoom(null)}
				onDelete={handleDeleteRoom}
			/>
		</div>
	);
}
