"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Tenant } from "@/components/dashboard/tenants/types";

interface RoomDetailsSummaryProps {
	tenant: Tenant | null;
	notes: string | null;
}

const LONG_NOTE_LENGTH = 120;

export function RoomDetailsSummary({ tenant, notes }: RoomDetailsSummaryProps) {
	const t = useTranslations("app.rooms");
	const [isExpanded, setIsExpanded] = useState(false);
	const trimmedNotes = notes?.trim() ?? "";
	const hasNotes = trimmedNotes.length > 0;
	const hasLongNotes = trimmedNotes.length > LONG_NOTE_LENGTH;

	if (!tenant && !hasNotes) return null;

	const contacts = [tenant?.phone, tenant?.email].filter(
		(value): value is string => Boolean(value),
	);

	return (
		<div className="mt-4 grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1.5 border-t border-border pt-3 text-sm">
			{tenant && (
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
