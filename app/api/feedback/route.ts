import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { feedbackSchema } from "@/lib/validations/feedback";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitFeedback(request: NextRequest) {
	try {
		const body = await request.json();

		const validation = feedbackSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name, email, type, message } = validation.data;

		const typeLabels: Record<string, string> = {
			bug: "Bug Report",
			feature: "Feature Request",
			other: "Other",
		};

		await resend.emails.send({
			from: "Resend <feedback@resend.dev>",
			to: process.env.OWNER_EMAIL ?? "",
			subject: `New Feedback: ${typeLabels[type]}`,
			text: `New Feedback from ${name} (${email})\nType: ${typeLabels[type]}\nMessage: ${message}`,
		});

		return NextResponse.json({ message: "Feedback sent!" }, { status: 201 });
	} catch (err) {
		console.error("Feedback API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const POST = submitFeedback;
