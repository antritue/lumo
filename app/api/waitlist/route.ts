import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { waitlistSchema } from "@/lib/validations/waitlist";

export async function POST(request: NextRequest) {
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
