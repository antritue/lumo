import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Locale } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { BG } from "../design-tokens";
import { Counter } from "../primitives/Counter";
import { Cursor } from "../primitives/Cursor";
import { PopIn } from "../primitives/PopIn";
import { getPromoCopy } from "../promo-copy";
import { Caption } from "../shared/caption";
import { easings } from "../shared/easings";
import {
	getSnapshot,
	PageHeader,
	PropertyCard,
	RoomRow,
	selectPromoProperty,
} from "../shared/property-card";

// Local 180 = master 330 (snare). Cursor, flip, ring, and counter coincide here.
const CLICK_AT = 180;
// Pill center of the pending room row (tuned against scene stills).
const PILL_X = 570;
const PILL_Y = 660;

export function BoardMini({
	locale = "en",
}: {
	locale?: Locale;
}): React.ReactElement {
	const frame = useCurrentFrame();
	const copy = getPromoCopy(locale);
	const snapshot = getSnapshot(locale);
	const scale = interpolate(frame, [0, 240], [1.08, 1.0], {
		extrapolateRight: "clamp",
	});
	const property = selectPromoProperty(snapshot);
	const rooms = property.rooms.slice(0, 3);
	const pendingRoom =
		rooms.find((r) => r.payment?.status === "pending") ?? null;
	const collected = property.rooms
		.filter((r) => r.payment?.status === "paid")
		.reduce((sum, room) => sum + room.total, 0);
	const collectedAfterFlip = collected + (pendingRoom ? pendingRoom.total : 0);
	const flipped = frame >= CLICK_AT;
	const cursorX = interpolate(frame, [110, CLICK_AT], [2100, PILL_X], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: easings.soft,
	});
	const cursorY = interpolate(frame, [110, CLICK_AT], [1250, PILL_Y], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: easings.soft,
	});
	const ringSize = interpolate(frame, [CLICK_AT, CLICK_AT + 24], [0, 170], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const ringOpacity = interpolate(frame, [CLICK_AT, CLICK_AT + 24], [0.7, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const press = interpolate(
		frame,
		[CLICK_AT - 5, CLICK_AT, CLICK_AT + 10],
		[1, 0.78, 0.92],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);
	const statusLabels = {
		paid: copy.statusPaid,
		pending: copy.statusPending,
		notRecorded: copy.statusNotRecorded,
	};
	return (
		<AbsoluteFill
			style={{
				backgroundColor: BG,
				padding: 120,
				justifyContent: "center",
			}}
		>
			<div
				style={{
					transform: `scale(${scale})`,
					display: "flex",
					flexDirection: "column",
					gap: 40,
				}}
			>
				<PageHeader title={copy.pageHeaderTitle} period={snapshot.period} />
				<PropertyCard
					name={property.name}
					paidCount={property.paidCount + (flipped && pendingRoom ? 1 : 0)}
					totalRooms={property.rooms.length}
					paidCountLabel={copy.paidCount(
						property.paidCount + (flipped && pendingRoom ? 1 : 0),
						property.rooms.length,
					)}
					collectedLabel={copy.collected}
					collected={
						flipped ? (
							<Counter
								from={collected}
								to={collectedAfterFlip}
								startFrame={CLICK_AT}
								duration={30}
							/>
						) : (
							formatCurrency(collected)
						)
					}
				>
					{rooms.map((room, i) => (
						<PopIn key={room.id} startFrame={15 + i * 15}>
							<RoomRow
								room={room}
								labels={statusLabels}
								statusOverride={
									flipped && room.id === pendingRoom?.id ? "paid" : undefined
								}
							/>
						</PopIn>
					))}
				</PropertyCard>
			</div>
			{!pendingRoom ? null : frame < 105 ? null : (
				<Cursor x={cursorX} y={cursorY} scale={press} />
			)}
			{flipped && frame <= CLICK_AT + 24 && (
				<div
					style={{
						position: "absolute",
						left: PILL_X,
						top: PILL_Y,
						width: ringSize,
						height: ringSize,
						borderRadius: "50%",
						border: "6px solid rgba(78,124,91,0.5)",
						opacity: ringOpacity,
						transform: "translate(-50%, -50%)",
					}}
				/>
			)}
			<Caption text={copy.boardCaption1} showFrom={15} showUntil={140} />
			<Caption text={copy.boardCaption2} showFrom={150} showUntil={258} />
		</AbsoluteFill>
	);
}
