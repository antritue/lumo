import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPolarProductId, polar } from "@/lib/polar";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { checkoutSchema } from "@/lib/validations/checkout";

export async function createCheckout(request: NextRequest) {
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

		const validation = checkoutSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { tier } = validation.data;

		// Polar redirects the buyer here after payment. {CHECKOUT_ID} is a
		// Polar placeholder replaced with the actual session id; unused for now.
		const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout={CHECKOUT_ID}`;

		const checkout = await polar.checkouts.create({
			products: [getPolarProductId(tier)],
			externalCustomerId: user.id,
			customerEmail: user.email,
			successUrl,
		});

		return NextResponse.json({ url: checkout.url }, { status: 200 });
	} catch (err) {
		console.error("Checkout API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const POST = createCheckout;
