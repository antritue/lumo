import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { rentPaymentSchema } from "@/lib/validations/rent-payment";

export async function createRentPayment(request: NextRequest) {
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

		const validation = rentPaymentSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { roomId, period, amount, status } = validation.data;

		// Verify the room belongs to the user
		const { data: room, error: roomError } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.select("id")
			.eq("id", roomId)
			.eq("user_id", user.id)
			.single();

		if (roomError || !room) {
			return NextResponse.json({ error: "Room not found" }, { status: 404 });
		}

		// Insert payment record
		const { data, error } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENTS)
			.insert([
				{
					room_id: roomId,
					user_id: user.id,
					period,
					amount,
					status,
				},
			])
			.select()
			.single();

		if (error) {
			// Handle duplicate period for same room
			if (error.code === "23505") {
				return NextResponse.json(
					{ error: "A payment record already exists for this period" },
					{ status: 409 },
				);
			}
			throw error;
		}

		return NextResponse.json(data, { status: 201 });
	} catch (err) {
		console.error("Rent Payments API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const POST = createRentPayment;
