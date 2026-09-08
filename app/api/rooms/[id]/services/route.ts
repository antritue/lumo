import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { roomServiceOverrideSchema } from "@/lib/validations/room-service";

export async function listRoomServices(
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

		const { id: roomId } = await params;

		const { data: overrides, error } = await supabase
			.from(DATABASE_TABLES.ROOM_SERVICE_OVERRIDES)
			.select("*")
			.eq("room_id", roomId);

		if (error) {
			throw error;
		}

		return NextResponse.json(overrides ?? [], { status: 200 });
	} catch (err) {
		console.error("RoomServices API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export async function createRoomService(
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

		const { id: roomId } = await params;
		const body = await request.json();

		const validation = roomServiceOverrideSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const { serviceId, isEnabled, customFlatAmount, customUnitPrice } =
			validation.data;

		const row: Record<string, unknown> = {
			room_id: roomId,
			service_id: serviceId,
			user_id: user.id,
			is_enabled: isEnabled,
		};
		if (customFlatAmount !== undefined)
			row.custom_flat_amount = customFlatAmount;
		if (customUnitPrice !== undefined) row.custom_unit_price = customUnitPrice;

		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOM_SERVICE_OVERRIDES)
			.upsert(row, { onConflict: "room_id,service_id" })
			.select()
			.single();

		if (error) {
			throw error;
		}

		return NextResponse.json(data, { status: 201 });
	} catch (err) {
		console.error("RoomServices API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const GET = listRoomServices;
export const POST = createRoomService;
