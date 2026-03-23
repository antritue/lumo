import { z } from "zod";

export const roomSchema = z.object({
	name: z.string().min(1, "Room name is required"),
	propertyId: z.uuid("Property ID must be a valid UUID"),
	monthlyRent: z
		.number()
		.positive("Monthly rent must be positive")
		.nullable()
		.optional(),
	notes: z.string().nullable().optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;
