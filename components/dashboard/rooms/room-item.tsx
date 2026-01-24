"use client";

import { DoorOpen, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments";
import { PaymentStatusDot } from "@/components/dashboard/rent-payments/payment-status-dot";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Room } from "./types";

interface RoomItemProps {
	room: Room;
	onEdit?: (room: Room) => void;
	onDelete?: (room: Room) => void;
}

export function RoomItem({ room, onEdit, onDelete }: RoomItemProps) {
	const t = useTranslations("app.rooms");
	const locale = useLocale();

	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onEdit?.(room);
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onDelete?.(room);
	};

	const getLatestPaymentStatus = (roomId: string) => {
		const payments = useRentPaymentsStore.getState().rentPayments;
		const latest = payments
			.filter((p) => p.roomId === roomId)
			.sort((a, b) => b.period.localeCompare(a.period))[0];
		return latest?.status ?? null;
	};

	return (
		<Link href={`/dashboard/rooms/${room.id}`} className="block">
			<div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-background hover:bg-muted/50 transition-colors group">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 shrink-0">
					<DoorOpen className="h-4 w-4 text-muted-foreground" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<p className="font-medium text-sm truncate">{room.name}</p>
						<PaymentStatusDot status={getLatestPaymentStatus(room.id)} />
					</div>
					{room.monthlyRent && (
						<p className="text-xs text-muted-foreground">
							{formatCurrency(room.monthlyRent, locale)}
						</p>
					)}
				</div>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleEdit}
						aria-label={t("edit")}
						className="h-8 w-8 hover:bg-muted"
					>
						<Pencil className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleDelete}
						aria-label={t("delete")}
						className="h-8 w-8 hover:bg-muted hover:text-destructive"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		</Link>
	);
}
