export interface Room {
	id: string;
	propertyId: string;
	name: string;
	monthlyRent: number | null;
	notes: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface RoomService {
	id: string;
	roomId: string;
	serviceId: string;
	serviceName: string;
	unitLabel: string | null;
	pricingType: "flat" | "variable";
	flatAmount: number | null;
	unitPrice: number | null;
}
