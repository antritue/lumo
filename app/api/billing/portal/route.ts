import { ResourceNotFound } from "@polar-sh/sdk/models/errors/resourcenotfound";
import { type NextRequest, NextResponse } from "next/server";
import { polar } from "@/lib/polar";
import { createSupabaseServerClient } from "@/lib/supabase-server";

async function resolveCustomerId(user: {
	id: string;
	email?: string | null;
}): Promise<string | null> {
	try {
		const customer = await polar.customers.getExternal({
			externalId: user.id,
		});
		return customer.id;
	} catch (err) {
		if (!(err instanceof ResourceNotFound)) {
			throw err;
		}
		// Fall back to email lookup for customers created outside the app
		// checkout (e.g. direct Polar checkout links), which have no external id.
	}

	if (!user.email) {
		return null;
	}

	const customers = await polar.customers.list({ email: user.email, limit: 1 });
	return customers.result.items[0]?.id ?? null;
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

		const { customerPortalUrl } = await polar.customerSessions.create({
			customerId,
			returnUrl,
		});

		return NextResponse.json({ url: customerPortalUrl }, { status: 200 });
	} catch (err) {
		console.error("Customer Portal API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = createCustomerPortal;
