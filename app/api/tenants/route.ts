import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { tenantSchema } from "@/lib/validations/tenant";

export async function listTenants() {
	try {
		const supabase = await createSupabaseServerClient();

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// RLS policies automatically filter by user_id, but we're explicit here for clarity
		const { data, error } = await supabase
			.from(DATABASE_TABLES.TENANTS)
			.select("*")
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		return NextResponse.json(data.map(mapToCamelCase), { status: 200 });
	} catch (err) {
		console.error("Tenants API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function createTenant(request: NextRequest) {
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

		const validation = tenantSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { fullName, roomId, phone, email, notes } = validation.data;

		if (roomId) {
			const { data: room, error: roomError } = await supabase
				.from(DATABASE_TABLES.ROOMS)
				.select("id")
				.eq("id", roomId)
				.eq("user_id", user.id)
				.single();

			if (roomError || !room) {
				return NextResponse.json({ error: "Room not found" }, { status: 404 });
			}
		}

		const { data, error } = await supabase
			.from(DATABASE_TABLES.TENANTS)
			.insert([
				{
					user_id: user.id,
					room_id: roomId ?? null,
					full_name: fullName,
					phone: phone ?? null,
					email: email ?? null,
					notes: notes ?? null,
				},
			])
			.select()
			.single();

		if (error) {
			if (error.code === "23505") {
				return NextResponse.json(
					{ error: "Room already has an active tenant" },
					{ status: 409 },
				);
			}
			throw error;
		}

		return NextResponse.json(mapToCamelCase(data), { status: 201 });
	} catch (err) {
		console.error("Tenants API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listTenants;
export const POST = createTenant;
