import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: Request) {
	// Vercel automatically sends CRON_SECRET as an `Authorization: Bearer <secret>` header when invoking this cron job
	// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const supabase = createSupabaseAdminClient();
		// Insert rather than read: Supabase's pause heuristic counts user activity,
		// and each row is a durable record of a run that actually happened.
		const { error } = await supabase
			.from("cron_pings")
			.insert({ source: "vercel-cron" });

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
