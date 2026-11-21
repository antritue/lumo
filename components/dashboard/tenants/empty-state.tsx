"use client";

import { Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { Button } from "@/components/ui/button";
import { useTenantsStore } from "./store";
import type { TenantInput } from "./types";
import { UpsertTenantDialog } from "./upsert-tenant-dialog";

export function TenantEmptyState() {
	const t = useTranslations("app.tenants");
	const tenants = useTenantsStore((state) => state.tenants);
	const createTenant = useTenantsStore((state) => state.createTenant);
	const rooms = useRoomsStore((state) => state.rooms);
	const properties = usePropertiesStore((state) => state.properties);
	const [isAdding, setIsAdding] = useState(false);

	const occupiedRoomIds = useMemo(
		() =>
			new Set(
				tenants
					.filter((tenant) => tenant.roomId)
					.map((tenant) => tenant.roomId as string),
			),
		[tenants],
	);

	const handleSave = async (input: TenantInput) => {
		await createTenant(input);
	};

	return (
		<>
			<div className="flex flex-col items-center justify-center py-16 sm:py-20">
				<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/50">
					<Users className="h-10 w-10 text-muted-foreground" />
				</div>
				<h2 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
					{t("emptyTitle")}
				</h2>
				<p className="mb-8 max-w-md text-center text-sm text-muted-foreground sm:text-base">
					{t("emptySubtitle")}
				</p>

				<Button onClick={() => setIsAdding(true)} size="lg">
					<Plus />
					{t("addButton")}
				</Button>
			</div>

			<UpsertTenantDialog
				mode="add"
				open={isAdding}
				onOpenChange={setIsAdding}
				onSave={handleSave}
				rooms={rooms}
				properties={properties}
				occupiedRoomIds={occupiedRoomIds}
			/>
		</>
	);
}
