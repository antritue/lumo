"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateRoomForm } from "./create-room-form";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { EditRoomDialog } from "./edit-room-dialog";
import { RoomCard } from "./room-card";
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

	const handleCreate = (name: string) => {
		createRoom(propertyId, name);
		setIsAdding(false);
	};

	const handleEdit = (room: Room) => {
		setEditingRoom(room);
	};

	const handleSave = (id: string, name: string) => {
		updateRoom(id, name);
		setEditingRoom(null);
	};

	const handleDelete = (room: Room) => {
		setDeletingRoom(room);
	};

	const handleConfirmDelete = (id: string) => {
		deleteRoom(id);
		setDeletingRoom(null);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl sm:text-2xl font-semibold text-foreground">
					{t("listTitle")} ({rooms.length})
				</h2>
			</div>

			<div className="grid gap-4">
				{rooms.map((room) => (
					<RoomCard
						key={room.id}
						room={room}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>
				))}
			</div>

			{!isAdding ? (
				<Button
					onClick={() => setIsAdding(true)}
					variant="outline"
					size="lg"
					className="w-full"
				>
					<Plus className="mr-2" />
					{t("addAnother")}
				</Button>
			) : (
				<CreateRoomForm
					onSubmit={handleCreate}
					onCancel={() => setIsAdding(false)}
					showCancel
				/>
			)}

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
