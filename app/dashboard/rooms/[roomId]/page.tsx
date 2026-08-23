"use client";

import { use, useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { RoomDetail } from "@/components/dashboard/rooms/room-detail";
import { RoomNotFound } from "@/components/dashboard/rooms/room-not-found";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomDetailPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const { roomId } = use(params);
	const room = useRoomsStore((state) => state.getRoomById(roomId));
	const isRoomsLoading = useRoomsStore((state) => state.isRoomsLoading);
	const isRoomsFetchFailed = useRoomsStore((state) => state.isRoomsFetchFailed);
	const fetchRoomById = useRoomsStore((state) => state.fetchRoomById);
	const user = useAuthStore((state) => state.user);
	const authLoading = useAuthStore((state) => state.loading);

	useEffect(() => {
		if (user) {
			fetchRoomById(roomId);
		}
	}, [roomId, user, fetchRoomById]);

	if (isRoomsLoading || authLoading) {
		return (
			<div className="max-w-4xl mx-auto py-4 px-4 space-y-8">
				<div className="space-y-6">
					<Skeleton className="h-4 w-40" />
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-12 w-12 rounded-xl" />
							<div className="space-y-2">
								<Skeleton className="h-6 w-48" />
								<Skeleton className="h-4 w-28" />
							</div>
						</div>
						<div className="flex gap-1">
							<Skeleton className="h-9 w-9 rounded-full" />
							<Skeleton className="h-9 w-9 rounded-full" />
						</div>
					</div>
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-5 w-5 rounded-full" />
						<div className="flex-1" />
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
					<div className="flex flex-wrap gap-2">
						<Skeleton className="h-8 w-20 rounded-full" />
						<Skeleton className="h-8 w-24 rounded-full" />
						<Skeleton className="h-8 w-16 rounded-full" />
					</div>
				</div>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Skeleton className="h-4 w-24" />
						<div className="flex-1" />
						<Skeleton className="h-8 w-8 rounded-full" />
					</div>
					<div className="space-y-2">
						{["p-sk-0", "p-sk-1"].map((key) => (
							<div
								key={key}
								className="flex items-center gap-3 px-3.5 py-3 rounded-xl"
							>
								<Skeleton className="h-8 w-8 rounded-lg" />
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-16 rounded-full" />
								<div className="flex-1" />
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-7 w-7 rounded-md" />
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-4 px-4">
			{isRoomsFetchFailed && !isRoomsLoading ? (
				<ErrorState onRetry={() => fetchRoomById(roomId)} />
			) : room ? (
				<RoomDetail room={room} />
			) : (
				<RoomNotFound />
			)}
		</div>
	);
}
