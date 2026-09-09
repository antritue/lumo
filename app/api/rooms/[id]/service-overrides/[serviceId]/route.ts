import { type NextRequest, NextResponse } from "next/server";
import { DATABASE_TABLES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function deleteRoomServiceOverride(
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

		const { id: roomId, serviceId } = await params;

		const { error, count } = await supabase
			.from(DATABASE_TABLES.ROOM_SERVICE_OVERRIDES)
			.delete({ count: "exact" })
			.eq("room_id", roomId)
			.eq("service_id", serviceId);

		if (error) {
			throw error;
		}

		if (count === 0) {
			return NextResponse.json(
				{ error: "Room service override not found" },
				{ status: 404 },
			);
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error("RoomServices API Error:", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}

export const DELETE = deleteRoomServiceOverride;
