import { z } from "zod";

export const rentPaymentSchema = z.object({
	roomId: z.uuid("Room ID must be a valid UUID"),
	period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format"),
	rentAmount: z.number().positive("Rent amount must be positive"),
	status: z.enum(["pending", "paid"]).optional().default("pending"),
	payerTenantId: z
		.uuid("Payer tenant ID must be a valid UUID")
		.nullable()
		.optional(),
	payerName: z.string().nullable().optional(),
});

export type RentPaymentInput = z.infer<typeof rentPaymentSchema>;

export const rentPaymentChargesSchema = z.array(
	z.object({
		serviceId: z.string(),
		serviceName: z.string(),
		pricingType: z.enum(["flat", "variable"]),
		unitLabel: z.string().optional().nullable(),
		unitPrice: z.number().nonnegative().optional().nullable(),
		flatAmount: z.number().nonnegative().optional().nullable(),
		usage: z.number().nonnegative().optional().nullable(),
	}),
);
