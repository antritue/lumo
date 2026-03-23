import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { roomSchema } from "@/lib/validations/room";

export async function GET(
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

		// Get room - RLS policy ensures user can only access their own rooms
		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.select("*")
			.eq("id", id)
			.eq("user_id", user.id)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Room not found" }, { status: 404 });
			}
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

		// Delete room - RLS policy ensures user can only delete their own rooms
		const { error, count } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.delete({ count: "exact" })
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		// Check if room was found and deleted
		if (count === 0) {
			return NextResponse.json({ error: "Room not found" }, { status: 404 });
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("Rooms API Error:", err);
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

		// Validate request body - omit propertyId (can't change) and make fields optional for partial update
		const validation = roomSchema
			.omit({ propertyId: true })
			.partial()
			.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name, monthlyRent, notes } = validation.data;

		// Build update object with only provided fields
		const updateData: Record<string, unknown> = {};
		if (name !== undefined) updateData.name = name;
		if (monthlyRent !== undefined) updateData.monthly_rent = monthlyRent;
		if (notes !== undefined) updateData.notes = notes;

		// Update room - RLS policy ensures user can only update their own rooms
		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.update(updateData)
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			// Check if room doesn't exist or doesn't belong to user
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Room not found" }, { status: 404 });
			}
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
