import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { serviceSchema } from "@/lib/validations/service";

export async function listServices() {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { data, error } = await supabase
			.from(DATABASE_TABLES.SERVICES)
			.select("*")
			.eq("user_id", user.id)
			.order("name");

		if (error) {
			throw error;
		}

		return NextResponse.json(data.map(mapToCamelCase), { status: 200 });
	} catch (err) {
		console.error("Services API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function createService(request: NextRequest) {
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

		const validation = serviceSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name, unitLabel, pricingType, flatAmount, unitPrice } =
			validation.data;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.SERVICES)
			.insert([
				{
					user_id: user.id,
					name,
					unit_label: unitLabel ?? null,
					pricing_type: pricingType,
					flat_amount: flatAmount ?? null,
					unit_price: unitPrice ?? null,
				},
			])
			.select()
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json(mapToCamelCase(data), { status: 201 });
	} catch (err) {
		console.error("Services API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listServices;
export const POST = createService;
