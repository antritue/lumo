"use client";

import { DoorOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { Room } from "./types";

interface RoomCardProps {
	room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
	return (
		<Card className="hover:shadow-soft-lg transition-shadow">
			<CardHeader>
				<CardTitle className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
						<DoorOpen className="h-5 w-5 text-muted-foreground" />
					</div>
					{room.name}
				</CardTitle>
			</CardHeader>
		</Card>
	);
}
