"use client";

import {
	DoorOpen,
	Loader2,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatCurrency } from "@/lib/utils";
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
	const locale = useLocale();
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
		<div className="flex flex-col flex-1 min-h-0 space-y-4">
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
				<ErrorState onRetry={handleRetry} />
			)}

			{!isRoomsLoading && !roomsFetchFailed && (
				<div className="flex-1 min-h-0 overflow-y-auto">
					{propertyRooms.length > 0 && (
						<div className="space-y-1">
							{propertyRooms.map((room) => (
								<div
									key={room.id}
									className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-card border border-border"
								>
									<Link
										href={`/dashboard/rooms/${room.id}`}
										className="flex items-center gap-3 flex-1 min-w-0 rounded-lg -mx-1.5 -my-1.5 px-1.5 py-1.5 hover:bg-muted/50 transition-colors"
									>
										<div className="flex items-center justify-center rounded-lg bg-secondary p-2 shrink-0">
											<DoorOpen className="h-4 w-4 text-muted-foreground" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{room.name}
											</p>
										</div>
										{room.monthlyRent && (
											<p className="text-sm font-semibold text-foreground">
												{formatCurrency(room.monthlyRent, locale)}
											</p>
										)}
									</Link>
									<Popover>
										<PopoverTrigger className="flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors cursor-pointer">
											<MoreHorizontal className="h-4 w-4" />
										</PopoverTrigger>
										<PopoverContent align="end" className="w-36 p-1.5">
											<div className="flex flex-col gap-0.5">
												<button
													type="button"
													onClick={() => setUpsertRoom(room)}
													className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors cursor-pointer text-left"
												>
													<Pencil className="h-3.5 w-3.5" />
													{t("edit")}
												</button>
												<button
													type="button"
													onClick={() => setDeletingRoom(room)}
													className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-muted hover:text-destructive transition-colors cursor-pointer text-left"
												>
													<Trash2 className="h-3.5 w-3.5" />
													{t("delete")}
												</button>
											</div>
										</PopoverContent>
									</Popover>
								</div>
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
				</div>
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
