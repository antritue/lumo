import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { propertySchema } from "@/lib/validations/property";

export async function POST(request: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();

		// Validate request body
		const validation = propertySchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name } = validation.data;

		// Insert property with authenticated user's ID
		const { data, error } = await supabase
			.from(DATABASE_TABLES.PROPERTIES)
			.insert([{ name, user_id: user.id }])
			.select()
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json(data, { status: 201 });
	} catch (err) {
		console.error("Properties API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
