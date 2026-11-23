import { type NextRequest, NextResponse } from "next/server";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function deleteTenant(
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

		const { id } = await params;

		const { error, count } = await supabase
			.from(DATABASE_TABLES.TENANTS)
			.delete({ count: "exact" })
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		if (count === 0) {
			return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("Tenants API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const DELETE = deleteTenant;
