import { z } from "zod";

export const feedbackSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email(),
	type: z.enum(["bug", "feature", "other"]),
	message: z.string().min(1, "Message is required"),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
