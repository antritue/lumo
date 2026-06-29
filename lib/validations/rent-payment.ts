import { z } from "zod";

export const rentPaymentSchema = z.object({
	roomId: z.uuid("Room ID must be a valid UUID"),
	period: z.string().regex(/^\d{4}-\d{2}$/, "Period must be in YYYY-MM format"),
	rentAmount: z.number().positive("Rent amount must be positive"),
	status: z.enum(["pending", "paid"]).optional().default("pending"),
});

export type RentPaymentInput = z.infer<typeof rentPaymentSchema>;
