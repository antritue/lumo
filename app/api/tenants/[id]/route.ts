import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { tenantSchema } from "@/lib/validations/tenant";

export async function deleteTenant(
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
			.from(DATABASE_TABLES.TENANTS)
			.delete({ count: "exact" })
			.eq("id", id)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		if (count === 0) {
			return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("Tenants API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function updateTenant(
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

		const validation = tenantSchema.partial().safeParse(body);
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

		const updateData: Record<string, unknown> = {};
		if (fullName !== undefined) updateData.full_name = fullName;
		if (roomId !== undefined) updateData.room_id = roomId;
		if (phone !== undefined) updateData.phone = phone;
		if (email !== undefined) updateData.email = email;
		if (notes !== undefined) updateData.notes = notes;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.TENANTS)
			.update(updateData)
			.eq("id", id)
			.eq("user_id", user.id)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return NextResponse.json(
					{ error: "Tenant not found" },
					{ status: 404 },
				);
			}
			if (error.code === "23505") {
				return NextResponse.json(
					{ error: "Room already has an active tenant" },
					{ status: 409 },
				);
			}
			throw error;
		}

		return NextResponse.json(mapToCamelCase(data), { status: 200 });
	} catch (err) {
		console.error("Tenants API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const PATCH = updateTenant;
export const DELETE = deleteTenant;
