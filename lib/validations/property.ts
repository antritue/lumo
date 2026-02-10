import { z } from "zod";

export const propertySchema = z.object({
	name: z.string().min(1, "Property name is required"),
});

export type PropertyInput = z.infer<typeof propertySchema>;
