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

export async function updatePropertyService(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; serviceId: string }> },
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

		const { id: propertyId, serviceId } = await params;
		const body = await request.json();

		const validation = propertyServiceSchema.partial().safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { serviceName, unitLabel, pricingType, flatAmount, unitPrice } =
			validation.data;

		const updateData: Record<string, unknown> = {};
		if (serviceName !== undefined) updateData.service_name = serviceName;
		if (unitLabel !== undefined) updateData.unit_label = unitLabel;
		if (pricingType !== undefined) updateData.pricing_type = pricingType;
		if (flatAmount !== undefined) updateData.flat_amount = flatAmount;
		if (unitPrice !== undefined) updateData.unit_price = unitPrice;

		if (Object.keys(updateData).length === 0) {
			const { data, error } = await supabase
				.from(DATABASE_TABLES.PROPERTY_SERVICES)
				.select()
				.eq("property_id", propertyId)
				.eq("service_id", serviceId)
				.eq("user_id", user.id)
				.single();

			if (error) {
				if (error.code === "PGRST116") {
					return NextResponse.json(
						{ error: "Property service not found" },
						{ status: 404 },
					);
				}
				throw error;
			}

			return NextResponse.json(mapPropertyService(data), { status: 200 });
		}

		const { data, error } = await supabase
			.from(DATABASE_TABLES.PROPERTY_SERVICES)
			.update(updateData)
			.eq("property_id", propertyId)
			.eq("service_id", serviceId)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Property service not found" },
					{ status: 404 },
				);
			}
			throw error;
		}

		return NextResponse.json(mapPropertyService(data), { status: 200 });
	} catch (err) {
		console.error("PropertyServices API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function deletePropertyService(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string; serviceId: string }> },
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

		const { id: propertyId, serviceId } = await params;

		const { error, count } = await supabase
			.from(DATABASE_TABLES.PROPERTY_SERVICES)
			.delete({ count: "exact" })
			.eq("property_id", propertyId)
			.eq("service_id", serviceId)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		if (count === 0) {
			return NextResponse.json(
				{ error: "Property service not found" },
				{ status: 404 },
			);
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("PropertyServices API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const PATCH = updatePropertyService;
export const DELETE = deletePropertyService;
