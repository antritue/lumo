"use client";

import { DoorOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { CreateRoomForm } from "./create-room-form";
import { useRoomsStore } from "./store";

interface EmptyStateProps {
	propertyId: string;
}

export function EmptyState({ propertyId }: EmptyStateProps) {
	const t = useTranslations("app.rooms");
	const createRoom = useRoomsStore((state) => state.createRoom);

	const handleCreate = (
		name: string,
		monthlyRent: number | null,
		notes: string | null,
	) => {
		createRoom(propertyId, name, monthlyRent, notes);
	};

	return (
		<div className="flex flex-col items-center justify-center pb-8 sm:pb-12">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 mb-6">
				<DoorOpen className="h-10 w-10 text-muted-foreground" />
			</div>
			<h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
				{t("emptyTitle")}
			</h2>
			<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
				{t("emptySubtitle")}
			</p>

			<div className="w-full max-w-md">
				<CreateRoomForm onSubmit={handleCreate} />
			</div>
		</div>
	);
}
