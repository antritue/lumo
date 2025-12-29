import { z } from "zod";

export const waitlistSchema = z.object({
    email: z.email(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
