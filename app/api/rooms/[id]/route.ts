import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { roomSchema } from "@/lib/validations/room";

export async function getRoom(
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

		return NextResponse.json(mapToCamelCase(data), { status: 200 });
	} catch (err) {
		console.error("Rooms API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function deleteRoom(
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
			.from(DATABASE_TABLES.ROOMS)
			.delete({ count: "exact" })
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

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

export async function updateRoom(
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

		const updateData: Record<string, unknown> = {};
		if (name !== undefined) updateData.name = name;
		if (monthlyRent !== undefined) updateData.monthly_rent = monthlyRent;
		if (notes !== undefined) updateData.notes = notes;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.update(updateData)
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json({ error: "Room not found" }, { status: 404 });
			}
			throw error;
		}

		return NextResponse.json(mapToCamelCase(data), { status: 200 });
	} catch (err) {
		console.error("Rooms API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = getRoom;
export const DELETE = deleteRoom;
export const PATCH = updateRoom;
