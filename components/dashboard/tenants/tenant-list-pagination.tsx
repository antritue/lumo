"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TenantListPaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const MAX_PAGE_BUTTONS = 5;

/** Page numbers to render, with a string marking an ellipsis gap. */
function getPageItems(page: number, totalPages: number): (number | string)[] {
	if (totalPages <= MAX_PAGE_BUTTONS) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const start = Math.min(Math.max(page - 1, 2), totalPages - 3);
	const end = Math.min(start + 2, totalPages - 1);
	const items: (number | string)[] = [1];

	if (start > 2) items.push("gap-start");
	for (let value = start; value <= end; value += 1) {
		items.push(value);
	}
	if (end < totalPages - 1) items.push("gap-end");
	items.push(totalPages);

	return items;
}

export function TenantListPagination({
	page,
	totalPages,
	onPageChange,
}: TenantListPaginationProps) {
	const t = useTranslations("app.tenants");

	if (totalPages <= 1) {
		return null;
	}

	const arrowClass =
		"flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40 cursor-pointer";

	return (
		<nav
			aria-label={t("paginationLabel")}
			className="flex items-center justify-center gap-1 border-t border-border/60 px-4 py-3"
		>
			<button
				type="button"
				aria-label={t("previousPage")}
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}
				className={arrowClass}
			>
				<ChevronLeft className="h-4 w-4" />
			</button>

			<span className="px-2 text-xs text-muted-foreground sm:hidden">
				{t("pageOf", { page, total: totalPages })}
			</span>

			<div className="hidden items-center gap-1 sm:flex">
				{getPageItems(page, totalPages).map((item) =>
					typeof item === "string" ? (
						<span
							key={item}
							aria-hidden="true"
							className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
						>
							…
						</span>
					) : (
						<button
							key={item}
							type="button"
							aria-label={t("goToPage", { page: item })}
							aria-current={item === page ? "page" : undefined}
							onClick={() => onPageChange(item)}
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors cursor-pointer",
								item === page
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-secondary hover:text-foreground",
							)}
						>
							{item}
						</button>
					),
				)}
			</div>

			<button
				type="button"
				aria-label={t("nextPage")}
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}
				className={arrowClass}
			>
				<ChevronRight className="h-4 w-4" />
			</button>
		</nav>
	);
}
