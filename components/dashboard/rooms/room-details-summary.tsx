"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Tenant } from "@/components/dashboard/tenants/types";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomDetailsSummaryProps {
	tenant: Tenant | null;
	notes: string | null;
	isTenantLoading?: boolean;
	isTenantFetchFailed?: boolean;
	onRetryTenant?: () => void;
}

const LONG_NOTE_LENGTH = 120;

export function RoomDetailsSummary({
	tenant,
	notes,
	isTenantLoading = false,
	isTenantFetchFailed = false,
	onRetryTenant,
}: RoomDetailsSummaryProps) {
	const t = useTranslations("app.rooms");
	const [isExpanded, setIsExpanded] = useState(false);
	const trimmedNotes = notes?.trim() ?? "";
	const hasNotes = trimmedNotes.length > 0;
	const hasLongNotes = trimmedNotes.length > LONG_NOTE_LENGTH;

	if (!tenant && !hasNotes && !isTenantLoading && !isTenantFetchFailed) {
		return null;
	}

	const contacts = [tenant?.phone, tenant?.email].filter(
		(value): value is string => Boolean(value),
	);

	return (
		<div className="mt-4 grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1.5 border-t border-border pt-3 text-sm">
			{tenant ? (
				<>
					<span className="whitespace-nowrap text-muted-foreground">
						{t("details.tenant")}
					</span>
					<p className="min-w-0 break-words">
						<span className="font-medium text-foreground">
							{tenant.fullName}
						</span>
						{contacts.map((contact) => (
							<span key={contact}>
								<span aria-hidden="true"> · </span>
								{contact}
							</span>
						))}
					</p>
				</>
			) : (
				(isTenantLoading || isTenantFetchFailed) && (
					<>
						<span className="whitespace-nowrap text-muted-foreground">
							{t("details.tenant")}
						</span>
						{isTenantLoading ? (
							<div className="flex items-center gap-2 py-0.5">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
						) : (
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-destructive">
									{t("details.tenantLoadFailed")}
								</span>
								{onRetryTenant && (
									<button
										type="button"
										onClick={onRetryTenant}
										className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
									>
										{t("details.retry")}
									</button>
								)}
							</div>
						)}
					</>
				)
			)}

			{hasNotes && (
				<>
					<span className="whitespace-nowrap text-muted-foreground">
						{t("details.note")}
					</span>
					<div className="min-w-0">
						<p
							className={`whitespace-pre-wrap break-words ${hasLongNotes && !isExpanded ? "line-clamp-2" : ""}`}
						>
							{trimmedNotes}
						</p>
						{hasLongNotes && (
							<button
								type="button"
								onClick={() => setIsExpanded((expanded) => !expanded)}
								className="mt-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
							>
								{isExpanded ? t("details.showLess") : t("details.showMore")}
							</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
