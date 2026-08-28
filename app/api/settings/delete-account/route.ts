import { NextResponse } from "next/server";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function DELETE() {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const tables = [
			DATABASE_TABLES.RENT_PAYMENT_CHARGES,
			DATABASE_TABLES.RENT_PAYMENTS,
			DATABASE_TABLES.ROOM_SERVICE_OVERRIDES,
			DATABASE_TABLES.PROPERTY_SERVICES,
			DATABASE_TABLES.ROOMS,
			DATABASE_TABLES.PROPERTIES,
			DATABASE_TABLES.USER_ENTITLEMENTS,
		];

		for (const table of tables) {
			const { error } = await supabase
				.from(table)
				.delete()
				.eq("user_id", user.id);

			if (error) {
				throw error;
			}
		}

		const adminClient = createSupabaseAdminClient();
		const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
			user.id,
		);

		if (deleteUserError) {
			throw deleteUserError;
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("Delete account error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
