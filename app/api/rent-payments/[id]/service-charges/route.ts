import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { rentPaymentChargesSchema } from "@/lib/validations/rent-payment";

function calculateChargeTotal(
	pricingType: string,
	flatAmount?: number | null,
	usage?: number | null,
	unitPrice?: number | null,
): number {
	if (pricingType === "flat") {
		return flatAmount ?? 0;
	}
	return (usage ?? 0) * (unitPrice ?? 0);
}

async function listPaymentServiceCharges(
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

		const { id: paymentId } = await params;

		const { data: payment, error: paymentError } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENTS)
			.select("id")
			.eq("id", paymentId)
			.eq("user_id", user.id)
			.single();

		if (paymentError || !payment) {
			return NextResponse.json({ error: "Payment not found" }, { status: 404 });
		}

		const { data, error } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENT_CHARGES)
			.select("*")
			.eq("rent_payment_id", paymentId);

		if (error) throw error;

		return NextResponse.json(data.map(mapToCamelCase), { status: 200 });
	} catch (err) {
		console.error("Rent Payment Service Charges API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

async function updatePaymentServiceCharges(
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

		const { id: paymentId } = await params;
		const body = await request.json();

		const bodyValidation = rentPaymentChargesSchema.safeParse(body);
		if (!bodyValidation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(bodyValidation.error) },
				{ status: 400 },
			);
		}

		const charges = bodyValidation.data;

		// Verify ownership
		const { data: payment, error: paymentError } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENTS)
			.select("id")
			.eq("id", paymentId)
			.eq("user_id", user.id)
			.single();

		if (paymentError || !payment) {
			return NextResponse.json({ error: "Payment not found" }, { status: 404 });
		}

		if (charges.length > 0) {
			const { error: upsertError } = await supabase
				.from(DATABASE_TABLES.RENT_PAYMENT_CHARGES)
				.upsert(
					charges.map((charge) => ({
						rent_payment_id: paymentId,
						user_id: user.id,
						service_id: charge.serviceId,
						service_name: charge.serviceName,
						pricing_type: charge.pricingType,
						unit_label: charge.unitLabel,
						unit_price: charge.unitPrice,
						flat_amount: charge.flatAmount,
						usage: charge.usage,
						total: calculateChargeTotal(
							charge.pricingType,
							charge.flatAmount,
							charge.usage,
							charge.unitPrice,
						),
					})),
					{ onConflict: "rent_payment_id, service_id" },
				);

			if (upsertError) throw upsertError;
		}

		const { data: savedCharges, error: fetchError } = await supabase
			.from(DATABASE_TABLES.RENT_PAYMENT_CHARGES)
			.select("*")
			.eq("rent_payment_id", paymentId);

		if (fetchError) throw fetchError;

		return NextResponse.json(savedCharges.map(mapToCamelCase), {
			status: 200,
		});
	} catch (err) {
		console.error("Rent Payment Service Charges API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listPaymentServiceCharges;
export const PATCH = updatePaymentServiceCharges;
