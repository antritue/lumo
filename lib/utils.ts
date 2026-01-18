import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale: string): string {
	return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", {
		style: "currency",
		currency: locale === "vi" ? "VND" : "USD",
		minimumFractionDigits: 0,
	}).format(amount);
}
