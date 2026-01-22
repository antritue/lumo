"use client";

import { use } from "react";
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

	return room ? <RoomDetail room={room} /> : <RoomNotFound />;
}
