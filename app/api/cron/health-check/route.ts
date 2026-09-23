import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const supabase = createSupabaseAdminClient();
		const { error } = await supabase.from("properties").select("id").limit(1);

		if (error) throw error;

		return NextResponse.json({
			status: "ok",
			timestamp: new Date().toISOString(),
		});
	} catch (err) {
		console.error("Health check ping failed:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
