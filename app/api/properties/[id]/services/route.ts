import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { propertyServiceSchema } from "@/lib/validations/property-service";

function mapPropertyService(
	row: Record<string, unknown>,
): Record<string, unknown> {
	return mapToCamelCase(row);
}

export async function listPropertyServices(
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

		const { id: propertyId } = await params;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.PROPERTY_SERVICES)
			.select()
			.order("service_name")
			.eq("property_id", propertyId)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		return NextResponse.json(data.map(mapPropertyService), { status: 200 });
	} catch (err) {
		console.error("PropertyServices API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function createPropertyService(
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

		const { id: propertyId } = await params;
		const body = await request.json();

		const validation = propertyServiceSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const {
			serviceId,
			serviceName,
			unitLabel,
			pricingType,
			flatAmount,
			unitPrice,
		} = validation.data;

		const insertData: Record<string, unknown> = {
			property_id: propertyId,
			service_id: serviceId,
			service_name: serviceName,
			user_id: user.id,
			pricing_type: pricingType,
		};
		if (unitLabel !== undefined) insertData.unit_label = unitLabel;
		if (flatAmount !== undefined) insertData.flat_amount = flatAmount;
		if (unitPrice !== undefined) insertData.unit_price = unitPrice;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.PROPERTY_SERVICES)
			.insert(insertData)
			.select()
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json(mapPropertyService(data), { status: 201 });
	} catch (err) {
		console.error("PropertyServices API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listPropertyServices;
export const POST = createPropertyService;
