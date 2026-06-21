import { z } from "zod";

export const propertyServiceSchema = z.object({
	serviceId: z.uuid(),
	serviceName: z.string(),
	unitLabel: z.string().nullable().optional(),
	pricingType: z.enum(["flat", "variable"]),
	flatAmount: z.number().positive().nullable().optional(),
	unitPrice: z.number().positive().nullable().optional(),
});

export type PropertyServiceInput = z.infer<typeof propertyServiceSchema>;
