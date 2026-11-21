"use client";

import { useMemo, useState } from "react";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { DeactivateTenantDialog } from "./deactivate-tenant-dialog";
import { DeleteTenantDialog } from "./delete-tenant-dialog";
import { selectVisibleTenants } from "./select-visible-tenants";
import { useTenantsStore } from "./store";
import { TenantFilterEmpty } from "./tenant-filter-empty";
import { TenantListPagination } from "./tenant-list-pagination";
import { TenantListTable } from "./tenant-list-table";
import { TenantToolbar } from "./tenant-toolbar";
import type { Tenant, TenantInput, TenantTab } from "./types";
import { UpsertTenantDialog } from "./upsert-tenant-dialog";

const TENANTS_PER_PAGE = 10;

export function TenantList() {
	const tenants = useTenantsStore((state) => state.tenants);
	const createTenant = useTenantsStore((state) => state.createTenant);
	const updateTenant = useTenantsStore((state) => state.updateTenant);
	const deactivateTenant = useTenantsStore((state) => state.deactivateTenant);
	const deleteTenant = useTenantsStore((state) => state.deleteTenant);

	const rooms = useRoomsStore((state) => state.rooms);
	const properties = usePropertiesStore((state) => state.properties);

	const [tab, setTab] = useState<TenantTab>("active");
	const [query, setQuery] = useState("");
	const [page, setPage] = useState(1);
	const [isAdding, setIsAdding] = useState(false);
	const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
	const [deactivatingTenant, setDeactivatingTenant] = useState<Tenant | null>(
		null,
	);
	const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

	const { items, counts } = useMemo(
		() => selectVisibleTenants(tenants, rooms, properties, tab, query),
		[tenants, rooms, properties, tab, query],
	);

	const totalPages = Math.max(1, Math.ceil(items.length / TENANTS_PER_PAGE));
	const currentPage = Math.min(page, totalPages);
	const visibleItems = items.slice(
		(currentPage - 1) * TENANTS_PER_PAGE,
		currentPage * TENANTS_PER_PAGE,
	);

	const editingId = editingTenant?.id;
	const occupiedRoomIds = useMemo(
		() =>
			new Set(
				tenants
					.filter((tenant) => tenant.roomId && tenant.id !== editingId)
					.map((tenant) => tenant.roomId as string),
			),
		[tenants, editingId],
	);

	const handleSave = async (input: TenantInput) => {
		if (editingTenant) {
			await updateTenant(editingTenant.id, input);
		} else {
			await createTenant(input);
		}
	};

	const closeUpsertDialog = (open: boolean) => {
		if (!open) {
			setIsAdding(false);
			setEditingTenant(null);
		}
	};

	const handleTabChange = (nextTab: TenantTab) => {
		setTab(nextTab);
		setPage(1);
	};

	const handleQueryChange = (nextQuery: string) => {
		setQuery(nextQuery);
		setPage(1);
	};

	const hasQuery = query.trim().length > 0;

	return (
		<div>
			<TenantToolbar
				tab={tab}
				counts={counts}
				query={query}
				onTabChange={handleTabChange}
				onQueryChange={handleQueryChange}
				onAdd={() => setIsAdding(true)}
			/>

			<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
				{items.length === 0 ? (
					<TenantFilterEmpty
						hasQuery={hasQuery}
						tab={tab}
						onClearSearch={() => handleQueryChange("")}
						onViewInactive={() => handleTabChange("inactive")}
					/>
				) : (
					<TenantListTable
						items={visibleItems}
						onEdit={setEditingTenant}
						onDeactivate={setDeactivatingTenant}
						onDelete={setDeletingTenant}
					/>
				)}

				<TenantListPagination
					page={currentPage}
					totalPages={totalPages}
					onPageChange={setPage}
				/>
			</div>

			<UpsertTenantDialog
				mode={editingTenant ? "edit" : "add"}
				tenant={editingTenant ?? undefined}
				open={isAdding || editingTenant !== null}
				onOpenChange={closeUpsertDialog}
				onSave={handleSave}
				rooms={rooms}
				properties={properties}
				occupiedRoomIds={occupiedRoomIds}
			/>

			<DeactivateTenantDialog
				tenant={deactivatingTenant}
				open={!!deactivatingTenant}
				onOpenChange={(open) => !open && setDeactivatingTenant(null)}
				onConfirm={deactivateTenant}
			/>

			<DeleteTenantDialog
				tenant={deletingTenant}
				open={!!deletingTenant}
				onOpenChange={(open) => !open && setDeletingTenant(null)}
				onConfirm={deleteTenant}
			/>
		</div>
	);
}
