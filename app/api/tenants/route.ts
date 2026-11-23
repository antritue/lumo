import { NextResponse } from "next/server";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";

export async function listTenants() {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// RLS policies automatically filter by user_id, but we're explicit here for clarity
		const { data, error } = await supabase
			.from(DATABASE_TABLES.TENANTS)
			.select("*")
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		return NextResponse.json(data.map(mapToCamelCase), { status: 200 });
	} catch (err) {
		console.error("Tenants API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listTenants;
