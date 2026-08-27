import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { overviewQuerySchema } from "@/lib/validations/overview";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const period = searchParams.get("period");

		if (!period) {
			return NextResponse.json(
				{ error: "period is required" },
				{ status: 400 },
			);
		}

		const validation = overviewQuerySchema.safeParse({ period });
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { data: properties, error: propertiesError } = await supabase
			.from(DATABASE_TABLES.PROPERTIES)
			.select("id, name")
			.eq("user_id", user.id);
		if (propertiesError) throw propertiesError;

		const { data: rooms, error: roomsError } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.select("id, property_id, name, monthly_rent")
			.eq("user_id", user.id);
		if (roomsError) throw roomsError;

		const roomIds = rooms.map((r) => r.id);

		let payments: Record<string, unknown>[] = [];
		if (roomIds.length > 0) {
			const { data, error } = await supabase
				.from(DATABASE_TABLES.RENT_PAYMENTS)
				.select("id, room_id, period, rent_amount, status")
				.eq("user_id", user.id)
				.eq("period", period)
				.in("room_id", roomIds);
			if (error) throw error;
			payments = data;
		}

		const paymentIds = payments.map((p) => p.id);

		let charges: Record<string, unknown>[] = [];
		if (paymentIds.length > 0) {
			const { data, error } = await supabase
				.from(DATABASE_TABLES.RENT_PAYMENT_CHARGES)
				.select("*")
				.in("rent_payment_id", paymentIds);
			if (error) throw error;
			charges = data;
		}

		const chargesByPaymentId: Record<string, unknown[]> = {};
		for (const row of charges) {
			const paymentId = row.rent_payment_id as string;
			if (!chargesByPaymentId[paymentId]) {
				chargesByPaymentId[paymentId] = [];
			}
			chargesByPaymentId[paymentId].push(mapToCamelCase(row));
		}

		const paymentByRoomId = new Map(payments.map((p) => [p.room_id, p]));

		const composedRooms = rooms.map((room) => {
			const payment = paymentByRoomId.get(room.id) as
				| Record<string, unknown>
				| undefined;
			const roomCharges = payment
				? (chargesByPaymentId[payment.id as string] ?? [])
				: [];
			const total = payment
				? (payment.rent_amount as number) +
					roomCharges.reduce(
						(sum: number, c: unknown) =>
							sum + ((c as Record<string, unknown>).total as number),
						0,
					)
				: 0;
			return {
				id: room.id,
				propertyId: room.property_id,
				name: room.name,
				monthlyRent: room.monthly_rent,
				payment: payment ? mapToCamelCase(payment) : null,
				charges: roomCharges,
				total,
			};
		});

		return NextResponse.json(
			{
				period,
				properties: properties.map(mapToCamelCase),
				rooms: composedRooms,
			},
			{ status: 200 },
		);
	} catch (err) {
		console.error("Overview API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
