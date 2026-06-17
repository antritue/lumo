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
	serviceId: string;
	pricingType: "flat" | "variable" | null;
	flatAmount: number | null;
	unitPrice: number | null;
}
