import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { serviceSchema } from "@/lib/validations/service";

export async function updateService(
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

		const validation = serviceSchema.partial().safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name, unitLabel, pricingType, flatAmount, unitPrice } =
			validation.data;

		const updateData: Record<string, unknown> = {};
		if (name !== undefined) updateData.name = name;
		if (unitLabel !== undefined) updateData.unit_label = unitLabel;
		if (pricingType !== undefined) updateData.pricing_type = pricingType;
		if (flatAmount !== undefined) updateData.flat_amount = flatAmount;
		if (unitPrice !== undefined) updateData.unit_price = unitPrice;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.SERVICES)
			.update(updateData)
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Service not found" },
					{ status: 404 },
				);
			}
			throw error;
		}

		return NextResponse.json(mapToCamelCase(data), { status: 200 });
	} catch (err) {
		console.error("Services API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function deleteService(
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
			.from(DATABASE_TABLES.SERVICES)
			.delete({ count: "exact" })
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		if (count === 0) {
			return NextResponse.json({ error: "Service not found" }, { status: 404 });
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("Services API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const PATCH = updateService;
export const DELETE = deleteService;
