"use client";

import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";
import { usePropertiesStore } from "@/components/dashboard/properties";
import { EmptyState } from "@/components/dashboard/rooms/empty-state";
import { RoomList } from "@/components/dashboard/rooms/room-list";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { Button } from "@/components/ui/button";

export default function PropertyDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const t = useTranslations("app.properties");

	const property = usePropertiesStore((state) =>
		state.properties.find((p) => p.id === id),
	);
	const allRooms = useRoomsStore((state) => state.rooms);
	const rooms = allRooms.filter((room) => room.propertyId === id);

	if (!property) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<p className="text-muted-foreground">{t("notFound")}</p>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="space-y-6">
				<Button variant="ghost" asChild className="mb-4 -ml-3">
					<Link href="/dashboard/properties">
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("backToProperties")}
					</Link>
				</Button>

				<div className="flex items-center gap-3 mb-8">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
						<Home className="h-6 w-6 text-muted-foreground" />
					</div>
					<h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
						{property.name}
					</h1>
				</div>

				{rooms.length === 0 ? (
					<EmptyState propertyId={id} />
				) : (
					<RoomList propertyId={id} rooms={rooms} />
				)}
			</div>
		</div>
	);
}
