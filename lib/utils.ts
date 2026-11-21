import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY_CODE } from "./constants";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
	return EMAIL_PATTERN.test(email);
}

export function formatCurrency(amount: number): string {
	// Always display VND with en-US grouping: comma for thousands.
	// e.g. ₫5,000 or ₫5,000,000 (even though vi locale would use dots)
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: CURRENCY_CODE,
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
	perMonth: string,
	defaultUnit: string,
): string {
	if (service.pricingType === "flat" && service.flatAmount != null) {
		return `${formatCurrency(service.flatAmount)}${perMonth}`;
	}
	if (service.pricingType === "variable" && service.unitPrice != null) {
		return `${formatCurrency(service.unitPrice)}/${service.unitLabel ?? defaultUnit}`;
	}
	return "";
}

export function formatAmountInputDisplay(rawValue: string): string {
	if (rawValue === "") return "";
	const withoutCommas = rawValue.replace(/,/g, "");
	if (withoutCommas === "" || withoutCommas === ".") return withoutCommas;
	const [intPart, ...decimalParts] = withoutCommas.split(".");
	const formattedInt = Number(intPart === "" ? "0" : intPart).toLocaleString(
		"en-US",
	);
	const hasTrailingDot =
		withoutCommas.endsWith(".") && decimalParts.length === 1;
	if (decimalParts.length === 0) return formattedInt;
	if (hasTrailingDot) return `${formattedInt}.`;
	return `${formattedInt}.${decimalParts.join("")}`;
}

export function parseAmountInputValue(displayValue: string): string {
	// Strip commas and any char that isn't a digit or dot, drop minus sign
	const cleaned = displayValue.replace(/,/g, "").replace(/[^0-9.]/g, "");
	if (cleaned === "") return "";
	// Keep only the first dot as decimal separator, max two decimal digits
	const [intPart, ...rest] = cleaned.split(".");
	if (rest.length === 0) return intPart;
	return `${intPart}.${rest.join("").slice(0, 2)}`;
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
