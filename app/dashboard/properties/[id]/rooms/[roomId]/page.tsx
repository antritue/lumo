"use client";

import { ArrowLeft, DoorOpen } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use } from "react";
import { usePropertiesStore } from "@/components/dashboard/properties";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoomDetailPage({
	params,
}: {
	params: Promise<{ id: string; roomId: string }>;
}) {
	const { id, roomId } = use(params);
	const t = useTranslations("app.rooms");

	const property = usePropertiesStore((state) =>
		state.properties.find((p) => p.id === id),
	);
	const room = useRoomsStore((state) => state.getRoomById(roomId));

	if (!property || !room) {
		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<div className="flex flex-col items-center justify-center py-12 sm:py-16">
					<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 mb-6">
						<DoorOpen className="h-10 w-10 text-muted-foreground" />
					</div>
					<h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
						{t("notFound")}
					</h1>
					<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
						{t("notFoundMessage")}
					</p>
					<Button asChild size="lg">
						<Link href={`/dashboard/properties/${id}`}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							{t("backToProperty")}
						</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="space-y-6">
				<Button variant="ghost" asChild className="mb-4 -ml-3">
					<Link href={`/dashboard/properties/${id}`}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("backToProperty")}
					</Link>
				</Button>
				{/* Room Header */}
				<div className="flex items-center gap-3">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
						<DoorOpen className="h-6 w-6 text-muted-foreground" />
					</div>
					<h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
						{room.name}
					</h1>
				</div>

				{/* Room Details Card */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">{t("details.title")}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center py-3 border-b">
							<span className="text-sm text-muted-foreground">
								{t("details.monthlyRent")}
							</span>
							<span className="text-base font-medium">
								{room.monthlyRent
									? new Intl.NumberFormat("en-US", {
											style: "currency",
											currency: "USD",
											minimumFractionDigits: 0,
										}).format(room.monthlyRent)
									: t("details.notSet")}
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Future: Payment History Section */}
				{/* This space is intentionally reserved for payment history functionality */}
				<div className="min-h-[200px]" />
			</div>
		</div>
	);
}
