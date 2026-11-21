"use client";

import { MoreHorizontal, Pencil, Trash2, UserMinus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Room } from "@/components/dashboard/rooms/types";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Tenant } from "./types";

interface TenantItemProps {
	tenant: Tenant;
	room?: Room;
	propertyName?: string | null;
	onEdit: (tenant: Tenant) => void;
	onDeactivate: (tenant: Tenant) => void;
	onDelete: (tenant: Tenant) => void;
}

export function TenantItem({
	tenant,
	room,
	propertyName,
	onEdit,
	onDeactivate,
	onDelete,
}: TenantItemProps) {
	const t = useTranslations("app.tenants");
	const isActive = tenant.roomId !== null;
	const hasPhone = Boolean(tenant.phone);
	const hasEmail = Boolean(tenant.email);

	return (
		<li className="grid grid-cols-[minmax(0,1fr)_auto_2rem] items-center gap-x-3 gap-y-1 px-4 py-3.5 transition-colors hover:bg-secondary/20 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.1fr)_6.5rem_2rem] sm:gap-4">
			<div className="min-w-0">
				<p className="truncate text-sm font-medium text-foreground">
					{tenant.fullName}
				</p>
				<p className="truncate text-xs text-muted-foreground sm:hidden">
					{room
						? `${room.name} · ${propertyName ?? ""}`.replace(/ · $/, "")
						: t("notAssigned")}
				</p>
			</div>

			<div className="hidden min-w-0 sm:block">
				{room ? (
					<>
						<p className="truncate text-sm text-foreground">{room.name}</p>
						<p className="truncate text-xs text-muted-foreground">
							{propertyName}
						</p>
					</>
				) : (
					<p className="text-sm text-muted-foreground">{t("notAssigned")}</p>
				)}
			</div>

			<div className="col-start-1 row-start-2 min-w-0 sm:col-start-3 sm:row-start-1">
				{hasPhone ? (
					<p className="truncate text-sm text-foreground">{tenant.phone}</p>
				) : null}
				{hasEmail ? (
					<p
						className={cn(
							"truncate text-xs",
							hasPhone ? "text-muted-foreground" : "text-sm text-foreground",
						)}
					>
						{tenant.email}
					</p>
				) : hasPhone ? (
					<p className="truncate text-xs text-muted-foreground">
						{t("noEmail")}
					</p>
				) : (
					<p className="truncate text-xs text-muted-foreground">
						{t("noContact")}
					</p>
				)}
			</div>

			<span
				className={cn(
					"inline-flex items-center gap-1.5 justify-self-end whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium sm:justify-self-start",
					isActive
						? "border-primary/30 bg-primary/5 text-primary"
						: "border-transparent bg-secondary text-muted-foreground",
				)}
			>
				<span
					className={cn(
						"h-1.5 w-1.5 rounded-full",
						isActive ? "bg-primary" : "bg-muted-foreground/50",
					)}
				/>
				{isActive ? t("statusActive") : t("statusInactive")}
			</span>

			<div className="justify-self-end">
				<Popover>
					<PopoverTrigger
						aria-label={t("actionsFor", { name: tenant.fullName })}
						className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
					>
						<MoreHorizontal className="h-4 w-4" />
					</PopoverTrigger>
					<PopoverContent align="end" className="w-40 p-1.5">
						<div className="flex flex-col gap-0.5">
							<button
								type="button"
								onClick={() => onEdit(tenant)}
								className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted cursor-pointer"
							>
								<Pencil className="h-3.5 w-3.5" />
								{t("edit")}
							</button>
							{isActive && (
								<button
									type="button"
									onClick={() => onDeactivate(tenant)}
									className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted cursor-pointer"
								>
									<UserMinus className="h-3.5 w-3.5" />
									{t("deactivate")}
								</button>
							)}
							<button
								type="button"
								onClick={() => onDelete(tenant)}
								className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-destructive transition-colors hover:bg-muted cursor-pointer"
							>
								<Trash2 className="h-3.5 w-3.5" />
								{t("delete")}
							</button>
						</div>
					</PopoverContent>
				</Popover>
			</div>
		</li>
	);
}
