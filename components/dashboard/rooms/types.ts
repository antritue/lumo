export interface Room {
	id: string;
	propertyId: string;
	name: string;
	monthlyRent: number | null;
	notes: string | null;
	createdAt: Date;
}
