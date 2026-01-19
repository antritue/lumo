"use client";

import { DoorOpen, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateRoomForm } from "./create-room-form";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { EditRoomDialog } from "./edit-room-dialog";
import { RoomItem } from "./room-item";
import { useRoomsStore } from "./store";
import type { Room } from "./types";

interface RoomListProps {
	propertyId: string;
	rooms: Room[];
}

export function RoomList({ propertyId, rooms }: RoomListProps) {
	const t = useTranslations("app.rooms");
	const createRoom = useRoomsStore((state) => state.createRoom);
	const updateRoom = useRoomsStore((state) => state.updateRoom);
	const deleteRoom = useRoomsStore((state) => state.deleteRoom);

	const [isAdding, setIsAdding] = useState(false);
	const [editingRoom, setEditingRoom] = useState<Room | null>(null);
	const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

	const handleCreate = (
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => {
		createRoom(propertyId, name, monthlyRent, notes);
		setIsAdding(false);
	};

	const handleEdit = (room: Room) => {
		setEditingRoom(room);
	};

	const handleSave = (
		id: string,
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => {
		updateRoom(id, name, monthlyRent, notes);
		setEditingRoom(null);
	};

	const handleDelete = (room: Room) => {
		setDeletingRoom(room);
	};

	const handleConfirmDelete = (id: string) => {
		deleteRoom(id);
		setDeletingRoom(null);
	};

	// Empty state: no rooms yet
	if (rooms.length === 0 && !isAdding) {
		return (
			<div className="flex flex-col items-center justify-center">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-3">
					<DoorOpen className="h-6 w-6 text-muted-foreground" />
				</div>
				<p className="text-sm text-muted-foreground mb-4 text-center">
					{t("emptySubtitle")}
				</p>
				<Button onClick={() => setIsAdding(true)} size="lg">
					<Plus className="mr-2 h-5 w-5" />
					{t("addButton")}
				</Button>
			</div>
		);
	}

	// Empty state with form visible
	if (rooms.length === 0 && isAdding) {
		return (
			<div className="pt-2">
				<CreateRoomForm
					onSubmit={handleCreate}
					onCancel={() => setIsAdding(false)}
					showCancel
				/>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{/* Room list */}
			{rooms.length > 0 && (
				<div className="space-y-2">
					{rooms.map((room) => (
						<RoomItem
							key={room.id}
							room={room}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			{/* Add room section */}
			{!isAdding ? (
				<div className="flex justify-center">
					<Button
						onClick={() => setIsAdding(true)}
						size="default"
						variant="secondary"
						className="border border-dashed border-border/50 hover:border-border hover:bg-muted/30"
					>
						<Plus className="mr-2 h-4 w-4" />
						{rooms.length === 0 ? t("addButton") : t("addAnother")}
					</Button>
				</div>
			) : (
				<div className="pt-2">
					<CreateRoomForm
						onSubmit={handleCreate}
						onCancel={() => setIsAdding(false)}
						showCancel
					/>
				</div>
			)}

			{/* Edit and Delete Dialogs */}
			<EditRoomDialog
				room={editingRoom}
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
