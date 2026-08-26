import type {
	PaymentRecord,
	ServiceCharge,
} from "@/components/dashboard/rent-payments/types";

export interface OverviewRoom {
	id: string;
	propertyId: string;
	name: string;
	monthlyRent: number | null;
	payment: PaymentRecord | null;
	charges: ServiceCharge[];
	total: number;
}

export interface OverviewProperty {
	id: string;
	name: string;
	rooms: OverviewRoom[];
	paidCount: number;
}

export interface OverviewSnapshot {
	period: string;
	properties: OverviewProperty[];
	rooms: OverviewRoom[];
}

export interface OverviewSummary {
	totalRooms: number;
	paidCount: number;
	pendingCount: number;
	collected: number;
	pending: number;
	notRecordedCount: number;
}
