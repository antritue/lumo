export interface Tenant {
	id: string;
	userId: string;
	roomId: string | null;
	fullName: string;
	phone: string | null;
	email: string | null;
	notes: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface TenantInput {
	fullName: string;
	roomId: string | null;
	phone: string | null;
	email: string | null;
	notes: string | null;
}

export type TenantTab = "active" | "inactive" | "all";
