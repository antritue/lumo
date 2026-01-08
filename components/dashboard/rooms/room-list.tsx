"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateRoomForm } from "./create-room-form";
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
	const [isAdding, setIsAdding] = useState(false);

	const handleCreate = (name: string) => {
		createRoom(propertyId, name);
		setIsAdding(false);
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
					<RoomCard key={room.id} room={room} />
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
		</div>
	);
}
