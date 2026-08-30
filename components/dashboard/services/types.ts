export interface Service {
	id: string;
	userId: string;
	serviceName: string;
	unitLabel: string | null;
	pricingType: "flat" | "variable";
	flatAmount: number | null;
	unitPrice: number | null;
	createdAt?: string;
	updatedAt?: string;
}
