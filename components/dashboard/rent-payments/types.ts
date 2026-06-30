export type PaymentStatus = "pending" | "paid";

export interface PaymentRecord {
	id: string;
	roomId: string;
	period: string; // Format: YYYY-MM (e.g., "2025-03" for March 2025)
	rentAmount: number;
	status: PaymentStatus;
}

export interface ServiceCharge {
	serviceId: string;
	serviceName: string;
	pricingType: "flat" | "variable";
	unitLabel?: string | null;
	unitPrice?: number | null;
	flatAmount?: number | null;
	usage?: number | null;
	total: number;
}
