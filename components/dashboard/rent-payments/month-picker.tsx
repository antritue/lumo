"use client";

import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MonthPickerProps {
	id?: string;
	value?: string; // YYYY-MM
	onChange: (value: string) => void;
	className?: string;
}

export function MonthPicker({
	id,
	value,
	onChange,
	className,
}: MonthPickerProps) {
	const t = useTranslations("app.rentPayments.form");
	const locale = useLocale();
	const [isOpen, setIsOpen] = useState(false);

	// Parse current value or use current date
	const today = new Date();
	const initialDate = value ? new Date(`${value}-01`) : today;
	const [viewYear, setViewYear] = useState(initialDate.getFullYear());

	// Generate month names for the current locale
	const monthNames = useMemo(() => {
		const formatter = new Intl.DateTimeFormat(locale, { month: "short" });
		return Array.from({ length: 12 }, (_, i) =>
			formatter.format(new Date(2024, i, 1)),
		);
	}, [locale]);

	const handleMonthSelect = (monthIndex: number) => {
		const formattedMonth = (monthIndex + 1).toString().padStart(2, "0");
		onChange(`${viewYear}-${formattedMonth}`);
		setIsOpen(false);
	};

	const setThisMonth = () => {
		const currentYear = today.getFullYear();
		const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
		setViewYear(currentYear);
		onChange(`${currentYear}-${currentMonth}`);
		setIsOpen(false);
	};

	const clearSelection = () => {
		onChange("");
		setIsOpen(false);
	};

	// Format display value: MM/YYYY (e.g., 01/2026)
	const displayValue = useMemo(() => {
		if (!value) return "";
		const [year, month] = value.split("-");
		return `${month}/${year}`;
	}, [value]);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					className={cn(
						"w-full justify-between h-12 px-4 rounded-xl font-normal text-base border-border bg-background hover:bg-background/80 active:scale-[0.98] transition-all",
						!value && "text-muted-foreground",
						className,
					)}
				>
					<span className="truncate">{displayValue || t("selectMonth")}</span>
					<CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="p-5 w-80 shadow-soft-lg border-border"
				align="start"
			>
				<div className="flex flex-col space-y-5">
					<div className="flex items-center justify-between px-1">
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9 rounded-full hover:bg-secondary transition-colors"
							onClick={() => setViewYear(viewYear - 1)}
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<span className="text-lg font-semibold tracking-tight">
							{viewYear}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9 rounded-full hover:bg-secondary transition-colors"
							onClick={() => setViewYear(viewYear + 1)}
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
					<div className="grid grid-cols-3 gap-2">
						{monthNames.map((month, index) => {
							const isSelected =
								value ===
								`${viewYear}-${(index + 1).toString().padStart(2, "0")}`;
							const isCurrent =
								today.getFullYear() === viewYear && today.getMonth() === index;

							return (
								<Button
									key={month}
									variant={isSelected ? "default" : "ghost"}
									className={cn(
										"h-12 rounded-xl text-sm font-medium transition-all duration-200",
										isSelected && "shadow-soft bg-primary hover:bg-primary/90",
										isCurrent &&
											!isSelected &&
											"bg-secondary text-primary font-bold",
										!isSelected && !isCurrent && "hover:bg-secondary",
									)}
									onClick={() => handleMonthSelect(index)}
								>
									{month}
								</Button>
							);
						})}
					</div>
					<div className="flex items-center justify-between border-t border-border/50 pt-4 px-1">
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-foreground h-10 px-4 rounded-xl transition-colors hover:bg-secondary"
							onClick={clearSelection}
						>
							{t("clear")}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="text-primary hover:text-primary/80 h-10 px-4 rounded-xl font-bold transition-colors hover:bg-secondary"
							onClick={setThisMonth}
						>
							{t("thisMonth")}
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
