"use client";

import { DoorOpen } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import { NotRecordedBadge, StatusBadge } from "./status-badge";
import type { OverviewRoom } from "./types";

interface RoomStatusRowProps {
	room: OverviewRoom;
}

export function RoomStatusRow({ room }: RoomStatusRowProps) {
	const locale = useLocale();
	const payment = room.payment;

	return (
		<Link href={`/dashboard/rooms/${room.id}`} className="block">
			<div className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-border/40 bg-background hover:bg-muted/50 transition-colors">
				<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 shrink-0">
					<DoorOpen className="h-4 w-4 text-muted-foreground" />
				</div>
				<span className="font-medium text-sm text-foreground truncate">
					{room.name}
				</span>
				{payment ? <StatusBadge payment={payment} /> : <NotRecordedBadge />}
				<div className="flex-1" />
				<p className="text-sm font-semibold text-foreground shrink-0">
					{formatCurrency(
						payment ? room.total : (room.monthlyRent ?? 0),
						locale,
					)}
				</p>
			</div>
		</Link>
	);
}
