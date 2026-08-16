import { z } from "zod";

export const checkoutSchema = z.object({
	tier: z.enum(["monthly", "yearly", "lifetime"]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
