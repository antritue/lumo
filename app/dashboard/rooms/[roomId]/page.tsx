"use client";

import { use, useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import {
	RoomDetail,
	RoomNotFound,
	useRoomsStore,
} from "@/components/dashboard/rooms";

export default function RoomDetailPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const { roomId } = use(params);
	const room = useRoomsStore((state) => state.getRoomById(roomId));
	const isRoomsLoading = useRoomsStore((state) => state.isRoomsLoading);
	const fetchRoomById = useRoomsStore((state) => state.fetchRoomById);
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);

	useEffect(() => {
		if (!room && user) {
			fetchRoomById(roomId);
		}
	}, [roomId, user, room, fetchRoomById]);

	if (isRoomsLoading || authLoading) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<div className="space-y-6">
					<div className="h-8 w-48 bg-muted rounded animate-pulse" />
					<div className="h-32 w-full bg-muted rounded animate-pulse" />
				</div>
			</div>
		);
	}

	return room ? <RoomDetail room={room} /> : <RoomNotFound />;
}
