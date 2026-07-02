"use client";

import { DoorOpen, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { RoomItem } from "./room-item";
import { useRoomsStore } from "./store";
import type { Room } from "./types";
import { UpsertRoomDialog } from "./upsert-room-dialog";

interface RoomListProps {
	propertyId: string;
	rooms: Room[];
	isRoomsLoading?: boolean;
}

export function RoomList({
	propertyId,
	rooms,
	isRoomsLoading = false,
}: RoomListProps) {
	const t = useTranslations("app.rooms");
	const createRoom = useRoomsStore((state) => state.createRoom);
	const updateRoom = useRoomsStore((state) => state.updateRoom);
	const deleteRoom = useRoomsStore((state) => state.deleteRoom);

	const [isAdding, setIsAdding] = useState(false);
	const [editingRoom, setEditingRoom] = useState<Room | null>(null);
	const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

	const handleSave = async (
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
	};

	const handleConfirmDelete = async (id: string) => {
		await deleteRoom(id);
		setDeletingRoom(null);
	};

	// Loading state while fetching rooms
	if (isRoomsLoading) {
		return (
			<div className="space-y-2">
				{["rl-sk-0", "rl-sk-1", "rl-sk-2"].map((key) => (
					<div key={key} className="flex items-center gap-3 p-3 rounded-lg">
						<Skeleton className="h-8 w-8 rounded-full" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-4 w-3/5" />
							<Skeleton className="h-3 w-1/4" />
						</div>
						<div className="flex gap-1">
							<Skeleton className="h-8 w-8 rounded-md" />
							<Skeleton className="h-8 w-8 rounded-md" />
						</div>
					</div>
				))}
			</div>
		);
	}

	// Empty state: no rooms yet
	if (rooms.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-3">
					<DoorOpen className="h-6 w-6 text-muted-foreground" />
				</div>
				<p className="text-sm text-muted-foreground mb-4 text-center">
					{t("emptySubtitle")}
				</p>
				<Button onClick={() => setIsAdding(true)} size="default">
					<Plus className="mr-2 h-5 w-5" />
					{t("addButton")}
				</Button>

				<UpsertRoomDialog
					mode="add"
					open={isAdding}
					onOpenChange={setIsAdding}
					onSave={handleSave}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="space-y-2">
				{rooms.map((room) => (
					<RoomItem
						key={room.id}
						room={room}
						onEdit={setEditingRoom}
						onDelete={(room) => setDeletingRoom(room)}
					/>
				))}
			</div>

			<div className="flex justify-center">
				<Button
					onClick={() => setIsAdding(true)}
					size="default"
					variant="secondary"
					className="border border-dashed border-border/50 hover:border-border hover:bg-muted/30"
				>
					<Plus className="mr-2 h-4 w-4" />
					{t("addAnother")}
				</Button>
			</div>

			<UpsertRoomDialog
				mode="add"
				open={isAdding}
				onOpenChange={setIsAdding}
				onSave={handleSave}
			/>

			<UpsertRoomDialog
				mode="edit"
				room={editingRoom ?? undefined}
				open={!!editingRoom}
				onOpenChange={(open) => !open && setEditingRoom(null)}
				onSave={handleSave}
			/>

			<DeleteRoomDialog
				room={deletingRoom}
				open={!!deletingRoom}
				onOpenChange={(open) => !open && setDeletingRoom(null)}
				onDelete={handleConfirmDelete}
			/>
		</div>
	);
}
