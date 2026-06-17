"use client";

import { ChevronRight, Home, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Property } from "./types";

interface PropertySidebarProps {
	properties: Property[];
	selectedId: string | null;
	onSelect: (property: Property) => void;
	onAdd: () => void;
}

export function PropertySidebar({
	properties,
	selectedId,
	onSelect,
	onAdd,
}: PropertySidebarProps) {
	const t = useTranslations("app.properties");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const ITEMS_PER_PAGE = 6;

	const filtered = useMemo(
		() =>
			properties.filter((p) =>
				p.name.toLowerCase().includes(searchQuery.toLowerCase()),
			),
		[properties, searchQuery],
	);

	const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

	const paginated = filtered.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentPage(1);
	};

	return (
		<div className="flex flex-col h-full bg-background">
			<div className="flex items-center gap-2 px-3 py-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
					<Input
						type="text"
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder={t("searchPlaceholder")}
						className="pl-9 h-9 text-sm rounded-full bg-card border-border"
					/>
				</div>
				<button
					type="button"
					onClick={onAdd}
					className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground shrink-0 hover:bg-primary/90 transition-colors cursor-pointer"
					aria-label={t("addButton")}
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>

			<div className="flex-1 px-3">
				<div className="space-y-1">
					{paginated.map((property) => (
						<button
							key={property.id}
							type="button"
							onClick={() => onSelect(property)}
							className={cn(
								"w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg border border-border bg-card transition-colors cursor-pointer",
								selectedId === property.id
									? "ring-2 ring-primary"
									: "hover:bg-muted/50",
							)}
						>
							<div className="flex items-center justify-center rounded-full bg-secondary p-2 shrink-0">
								<Home className="h-4 w-4 text-muted-foreground" />
							</div>
							<span className="flex-1 min-w-0 text-sm font-medium truncate">
								{property.name}
							</span>
							<ChevronRight
								className={cn(
									"h-4 w-4 shrink-0 transition-colors",
									selectedId === property.id
										? "text-foreground"
										: "text-muted-foreground",
								)}
							/>
						</button>
					))}
				</div>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between px-3 py-2.5 border-t border-border">
					<button
						type="button"
						className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
						disabled={currentPage <= 1}
						onClick={() => setCurrentPage((p) => p - 1)}
					>
						{t("previous")}
					</button>
					<span className="text-xs text-muted-foreground">
						{currentPage} / {totalPages}
					</span>
					<button
						type="button"
						className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
						disabled={currentPage >= totalPages}
						onClick={() => setCurrentPage((p) => p + 1)}
					>
						{t("next")}
					</button>
				</div>
			)}
		</div>
	);
}
