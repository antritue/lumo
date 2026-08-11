import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { getRoomLimit, getUserEntitlement } from "@/lib/entitlement";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { roomSchema } from "@/lib/validations/room";

export async function listRooms(request: NextRequest) {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const propertyId = searchParams.get("propertyId");

		if (!propertyId) {
			return NextResponse.json(
				{ error: "propertyId is required" },
				{ status: 400 },
			);
		}

		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOMS)
			.select("*")
			.eq("user_id", user.id)
			.eq("property_id", propertyId);

		if (error) {
			throw error;
		}

		return NextResponse.json(data.map(mapToCamelCase), { status: 200 });
	} catch (err) {
		console.error("Rooms API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function createRoom(request: NextRequest) {
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

		const validation = roomSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { name, propertyId, monthlyRent, notes } = validation.data;

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

		const entitlement = await getUserEntitlement(user.id, supabase);
		const roomLimit = getRoomLimit(entitlement);

		if (roomLimit !== null) {
			const { count, error: countError } = await supabase
				.from(DATABASE_TABLES.ROOMS)
				.select("id", { count: "exact", head: true })
				.eq("user_id", user.id);

			if (countError) {
				throw countError;
			}

			if ((count ?? 0) >= roomLimit) {
				return NextResponse.json(
					{ error: "ROOM_LIMIT_REACHED" },
					{ status: 403 },
				);
			}
		}

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

		return NextResponse.json(mapToCamelCase(data), { status: 201 });
	} catch (err) {
		console.error("Rooms API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listRooms;
export const POST = createRoom;
