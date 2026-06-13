import {
	BrushCleaning,
	Car,
	Droplet,
	HousePlus,
	type LucideIcon,
	Wifi,
	Zap,
} from "lucide-react";

export interface Service {
	id: string;
	userId: string;
	name: string;
	unitLabel: string | null;
	pricingType: "flat" | "variable";
	flatAmount: number | null;
	unitPrice: number | null;
	createdAt?: string;
	updatedAt?: string;
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
	electricity: Zap,
	water: Droplet,
	wifi: Wifi,
	cleaning: BrushCleaning,
	parking: Car,
};

export function getServiceIcon(name: string): LucideIcon {
	return SERVICE_ICONS[name.toLowerCase()] ?? HousePlus;
}
