import { type NextRequest, NextResponse } from "next/server";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";

export async function listRoomRentPaymentCharges(
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

		// Fetch all payment IDs for this room
		const { data: payments, error: paymentsError } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENTS)
			.select("id")
			.eq("room_id", roomId)
			.eq("user_id", user.id);

		if (paymentsError) throw paymentsError;

		const paymentIds = payments?.map((p) => p.id) ?? [];

		if (paymentIds.length === 0) {
			return NextResponse.json({}, { status: 200 });
		}

		const { data, error } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENT_CHARGES)
			.select("*, rent_payment_id")
			.in("rent_payment_id", paymentIds);

		if (error) throw error;

		// Group charges by payment id
		const grouped: Record<string, unknown[]> = {};
		for (const row of data) {
			const pid = row.rent_payment_id;
			if (!grouped[pid]) grouped[pid] = [];
			grouped[pid].push(mapToCamelCase(row));
		}

		return NextResponse.json(grouped, { status: 200 });
	} catch (err) {
		console.error("Room Rent Payment Charges API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listRoomRentPaymentCharges;
