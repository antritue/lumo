"use client";

import { ArrowLeft, DoorOpen } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function RoomNotFound() {
	const t = useTranslations("app");

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<div className="flex flex-col items-center justify-center py-12 sm:py-16">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50 mb-6">
					<DoorOpen className="h-10 w-10 text-muted-foreground" />
				</div>
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
					{t("rooms.notFound")}
				</h1>
				<p className="text-sm sm:text-base text-muted-foreground mb-8 text-center max-w-md">
					{t("rooms.notFoundMessage")}
				</p>
				<Button asChild size="lg">
					<Link href="/dashboard/properties">
						<ArrowLeft className="mr-2 h-4 w-4" />
						{t("properties.backToProperties")}
					</Link>
				</Button>
			</div>
		</div>
	);
}
