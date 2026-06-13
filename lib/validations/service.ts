import { z } from "zod";

export const serviceSchema = z.object({
	name: z.string().min(1, "Name is required"),
	unitLabel: z.string().nullable().optional(),
	pricingType: z.enum(["flat", "variable"]),
	flatAmount: z
		.number()
		.positive("Flat amount must be positive")
		.nullable()
		.optional(),
	unitPrice: z
		.number()
		.positive("Unit price must be positive")
		.nullable()
		.optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
