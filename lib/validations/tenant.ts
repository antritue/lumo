import { z } from "zod";

export const tenantSchema = z.object({
	fullName: z.string().min(1, "Tenant name is required"),
	roomId: z.uuid("Room ID must be a valid UUID").nullable().optional(),
	phone: z.string().nullable().optional(),
	email: z.email("Email must be valid").nullable().optional(),
	notes: z.string().nullable().optional(),
});

export type TenantInput = z.infer<typeof tenantSchema>;
