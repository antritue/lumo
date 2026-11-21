"use client";

import { useTranslations } from "next-intl";
import type { TenantListItem } from "./select-visible-tenants";
import { TenantItem } from "./tenant-item";
import type { Tenant } from "./types";

interface TenantListTableProps {
	items: TenantListItem[];
	onEdit: (tenant: Tenant) => void;
	onDeactivate: (tenant: Tenant) => void;
	onDelete: (tenant: Tenant) => void;
}

export function TenantListTable({
	items,
	onEdit,
	onDeactivate,
	onDelete,
}: TenantListTableProps) {
	const t = useTranslations("app.tenants");

	return (
		<>
			<div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.1fr)_6.5rem_2rem] items-center gap-4 border-b border-border/60 bg-secondary/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
				<span>{t("columns.tenant")}</span>
				<span>{t("columns.room")}</span>
				<span>{t("columns.contact")}</span>
				<span>{t("columns.status")}</span>
				<span className="sr-only">{t("columns.actions")}</span>
			</div>
			<ul className="divide-y divide-border/60">
				{items.map(({ tenant, room, propertyName }) => (
					<TenantItem
						key={tenant.id}
						tenant={tenant}
						room={room}
						propertyName={propertyName}
						onEdit={onEdit}
						onDeactivate={onDeactivate}
						onDelete={onDelete}
					/>
				))}
			</ul>
		</>
	);
}
