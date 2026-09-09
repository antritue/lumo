import { z } from "zod";

export const roomServiceOverrideSchema = z.object({
	serviceId: z.uuid(),
	isEnabled: z.boolean().optional().default(true),
	customFlatAmount: z.number().positive().nullable().optional(),
	customUnitPrice: z.number().positive().nullable().optional(),
});

export type RoomServiceOverrideInput = z.infer<
	typeof roomServiceOverrideSchema
>;
