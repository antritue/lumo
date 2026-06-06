import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { rentPaymentSchema } from "@/lib/validations/rent-payment";

export async function updateRentPayment(
	request: NextRequest,
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
		const body = await request.json();

		const validation = rentPaymentSchema
			.omit({ roomId: true })
			.extend({ status: z.enum(["pending", "paid"]).optional() })
			.partial()
			.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { period, amount, status } = validation.data;

		const updateData: Record<string, unknown> = {};
		if (period !== undefined) updateData.period = period;
		if (amount !== undefined) updateData.amount = amount;
		if (status !== undefined) updateData.status = status;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENTS)
			.update(updateData)
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Payment record not found" },
					{ status: 404 },
				);
			}
			throw error;
		}

		return NextResponse.json(mapToCamelCase(data), { status: 200 });
	} catch (err) {
		console.error("Rent Payments API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function deleteRentPayment(
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
			.from(DATABASE_TABLES.RENT_PAYMENTS)
			.delete({ count: "exact" })
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		if (count === 0) {
			return NextResponse.json(
				{ error: "Payment record not found" },
				{ status: 404 },
			);
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("Rent Payments API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const DELETE = deleteRentPayment;
export const PATCH = updateRentPayment;
