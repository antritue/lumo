import { errors } from "@polar-sh/sdk/2026-10";
import { type NextRequest, NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function resolveCustomerId(user: {
	id: string;
	email?: string | null;
}): Promise<string | null> {
	try {
		const customer = await polar.customers.getExternal(user.id);
		return customer.id;
	} catch (err) {
		if (!(err instanceof errors.ResourceNotFound)) {
			throw err;
		}
		// Fall back to email lookup for customers created outside the app
		// checkout (e.g. direct Polar checkout links), which have no external id.
	}

	if (!user.email) {
		return null;
	}

	const customers = await polar.customers.list({ email: user.email, limit: 1 });
	return customers.items[0]?.id ?? null;
}

export async function createCustomerPortal(request: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const customerId = await resolveCustomerId(user);
		if (!customerId) {
			return NextResponse.json(
				{ error: "No Polar customer found for this account" },
				{ status: 404 },
			);
		}

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
		const returnUrl = new URL("/dashboard/settings", baseUrl).toString();

		const { customer_portal_url } = await polar.customerSessions.create({
			customer_id: customerId,
			return_url: returnUrl,
		});

		return NextResponse.json({ url: customer_portal_url }, { status: 200 });
	} catch (err) {
		console.error("Customer Portal API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = createCustomerPortal;
