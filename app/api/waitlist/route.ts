import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { waitlistSchema } from "@/lib/validations/waitlist";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function joinWaitlist(request: NextRequest) {
	try {
		const body = await request.json();

		const validation = waitlistSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { email } = validation.data;
		const supabase = await createSupabaseServerClient();

		const { error } = await supabase
			.from(DATABASE_TABLES.WAITLIST)
			.insert([{ email }]);

		if (error) {
			// Postgres unique violation (email already exists)
			if (error.code === "23505") {
				return NextResponse.json(
					{ message: "You're already on the waitlist!" },
					{ status: 200 },
				);
			}
			throw error;
		}

		await resend.emails.send({
			from: "Resend <onboarding@resend.dev>",
			to: process.env.OWNER_EMAIL ?? "",
			subject: "New waitlist signup",
			text: `${email} just joined the waitlist.`,
		});

		return NextResponse.json(
			{ message: "Successfully joined the waitlist!" },
			{ status: 201 },
		);
	} catch (err) {
		console.error("Waitlist API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const POST = joinWaitlist;
