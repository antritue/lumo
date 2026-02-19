import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { propertySchema } from "@/lib/validations/property";

export async function DELETE(
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

		// Delete property - RLS policy ensures user can only delete their own properties
		const { error, count } = await supabase
			.from(DATABASE_TABLES.PROPERTIES)
			.delete({ count: "exact" })
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		// Check if property was found and deleted
		if (count === 0) {
			return NextResponse.json(
				{ error: "Property not found" },
				{ status: 404 },
			);
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("Properties API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
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

		// Validate request body
		const validation = propertySchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name } = validation.data;

		// Update property - RLS policy ensures user can only update their own properties
		const { data, error } = await supabase
			.from(DATABASE_TABLES.PROPERTIES)
			.update({ name })
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			// Check if property doesn't exist or doesn't belong to user
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Property not found" },
					{ status: 404 },
				);
			}
			throw error;
		}

		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		console.error("Properties API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
