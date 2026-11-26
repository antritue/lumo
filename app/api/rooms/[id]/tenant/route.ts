import { type NextRequest, NextResponse } from "next/server";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";

export async function getRoomTenant(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: roomId } = await params;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.TENANTS)
			.select("*")
			.eq("room_id", roomId)
			.eq("user_id", user.id)
			.maybeSingle();

		if (error) {
			throw error;
		}

		return NextResponse.json(data ? mapToCamelCase(data) : null, {
			status: 200,
		});
	} catch (err) {
		console.error("Room tenant API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = getRoomTenant;
