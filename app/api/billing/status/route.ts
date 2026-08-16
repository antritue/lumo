import { NextResponse } from "next/server";
import { DATABASE_TABLES } from "@/lib/constants";
import { getRoomLimit, getUserEntitlement, isPaid } from "@/lib/entitlement";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getBillingStatus() {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const entitlement = await getUserEntitlement(user.id, supabase);

		const { count, error: countError } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.select("id", { count: "exact", head: true })
			.eq("user_id", user.id);

		if (countError) {
			throw countError;
		}

		return NextResponse.json(
			{
				tier: entitlement?.tier ?? null,
				isPaid: isPaid(entitlement),
				roomLimit: getRoomLimit(entitlement),
				roomCount: count ?? 0,
			},
			{ status: 200 },
		);
	} catch (err) {
		console.error("Billing status API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = getBillingStatus;
