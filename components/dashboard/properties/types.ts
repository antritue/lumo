export interface Property {
	id: string;
	userId: string;
	name: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface PropertyService {
	id: string;
	propertyId: string;
	serviceName: string;
	unitLabel: string | null;
	pricingType: "flat" | "variable";
	flatAmount: number | null;
	unitPrice: number | null;
}
