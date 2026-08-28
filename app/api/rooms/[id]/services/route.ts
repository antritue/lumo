import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { mapToCamelCase } from "@/lib/utils";
import { roomServiceSchema } from "@/lib/validations/room-service";

function mapRoomService(row: Record<string, unknown>): Record<string, unknown> {
	return mapToCamelCase(row);
}

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

		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOM_SERVICE_OVERRIDES)
			.select()
			.order("service_name")
			.eq("room_id", roomId)
			.eq("user_id", user.id);

		if (error) {
			throw error;
		}

		return NextResponse.json(data.map(mapRoomService), { status: 200 });
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

		const validation = z.array(roomServiceSchema).safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: z.treeifyError(validation.error) },
				{ status: 400 },
			);
		}

		const insertDataArray = validation.data.map(
			({
				serviceId,
				serviceName,
				unitLabel,
				pricingType,
				flatAmount,
				unitPrice,
			}) => {
				const row: Record<string, unknown> = {
					room_id: roomId,
					service_id: serviceId,
					service_name: serviceName,
					user_id: user.id,
					pricing_type: pricingType,
				};
				if (unitLabel !== undefined) row.unit_label = unitLabel;
				if (flatAmount !== undefined) row.flat_amount = flatAmount;
				if (unitPrice !== undefined) row.unit_price = unitPrice;
				return row;
			},
		);

		const { data, error } = await supabase
			.from(DATABASE_TABLES.ROOM_SERVICE_OVERRIDES)
			.insert(insertDataArray)
			.select();

		if (error) {
			throw error;
		}

		return NextResponse.json(data.map(mapRoomService), { status: 201 });
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
