export interface PaymentRecord {
	id: string;
	roomId: string;
	period: string; // Format: YYYY-MM (e.g., "2025-03" for March 2025)
	amount: number;
}
