import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { roomSchema } from "@/lib/validations/room";

export async function GET(request: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get required property_id from query params
		const { searchParams } = new URL(request.url);
		const propertyId = searchParams.get("property_id");

		if (!propertyId) {
			return NextResponse.json(
				{ error: "property_id is required" },
				{ status: 400 },
			);
		}

		// Get rooms for the property - RLS policies automatically filter by user_id
		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.select("*")
			.eq("user_id", user.id)
			.eq("property_id", propertyId);

		if (error) {
			throw error;
		}

		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		console.error("Rooms API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
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

		// Validate request body
		const validation = roomSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name, propertyId, monthlyRent, notes } = validation.data;

		// Verify the property belongs to the user
		const { data: property, error: propertyError } = await supabase
			.from(DATABASE_TABLES.PROPERTIES)
			.select("id")
			.eq("id", propertyId)
			.eq("user_id", user.id)
			.single();

		if (propertyError || !property) {
			return NextResponse.json(
				{ error: "Property not found" },
				{ status: 404 },
			);
		}

		// Insert room with authenticated user's ID
		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.insert([
				{
					name,
					property_id: propertyId,
					user_id: user.id,
					monthly_rent: monthlyRent ?? null,
					notes: notes ?? null,
				},
			])
			.select()
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json(data, { status: 201 });
	} catch (err) {
		console.error("Rooms API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
