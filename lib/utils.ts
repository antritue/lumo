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

export function formatServicePrice(
	service: {
		pricingType: "flat" | "variable";
		flatAmount: number | null;
		unitPrice: number | null;
		unitLabel: string | null;
	},
	locale: string,
	perMonth: string,
	defaultUnit: string,
): string {
	if (service.pricingType === "flat" && service.flatAmount != null) {
		return `${formatCurrency(service.flatAmount, locale)}${perMonth}`;
	}
	if (service.pricingType === "variable" && service.unitPrice != null) {
		return `${formatCurrency(service.unitPrice, locale)}/${service.unitLabel ?? defaultUnit}`;
	}
	return "";
}

function toCamelCase(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function mapToCamelCase<T>(obj: Record<string, unknown>): T {
	const result: Record<string, unknown> = {};
	for (const key of Object.keys(obj)) {
		result[toCamelCase(key)] = obj[key];
	}
	return result as T;
}
