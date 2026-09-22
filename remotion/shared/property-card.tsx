import { formatCurrency } from "@/lib/utils";
import { computeOverviewSnapshot } from "../../components/dashboard/overview/compute-overview-snapshot";
import type {
	OverviewProperty,
	OverviewRoom,
	OverviewSnapshot,
} from "../../components/dashboard/overview/types";
import { buildDemoSeed, getCurrentPeriod } from "../../lib/demo-seed";
import {
	BORDER,
	CARD,
	CARD_RADIUS,
	FG,
	FONT_SANS,
	MUTED_FG,
	PAID,
	PAID_BG,
	PAID_BORDER,
	PENDING,
	PENDING_BG,
	PENDING_BORDER,
	PILL_RADIUS,
	ROW_RADIUS,
	SECONDARY,
} from "../design-tokens";

export const snapshot: OverviewSnapshot = (() => {
	const period = getCurrentPeriod();
	const seed = buildDemoSeed(period, "en");
	return computeOverviewSnapshot(
		seed.properties,
		seed.rooms,
		seed.rentPayments,
		seed.serviceChargesByPaymentId,
		seed.period,
	);
})();

/** The property shown in the promo board scenes: first property with <=3 rooms. */
export function selectPromoProperty(snapshot: {
	properties: OverviewProperty[];
}): OverviewProperty {
	return (
		snapshot.properties.find((p) => p.rooms.length <= 3) ??
		snapshot.properties[0]
	);
}

export function ChevronIcon(): React.ReactElement {
	return (
		<svg
			aria-hidden="true"
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke={MUTED_FG}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ flexShrink: 0 }}
		>
			<title>Expanded</title>
			<path d="m6 9 6 6 6-6" />
		</svg>
	);
}

export function ChevronRightIcon(): React.ReactElement {
	return (
		<svg
			aria-hidden="true"
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke={MUTED_FG}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ flexShrink: 0 }}
		>
			<title>Collapsed</title>
			<path d="m9 18 6-6-6-6" />
		</svg>
	);
}

function HomeIcon({ color }: { color: string }): React.ReactElement {
	return (
		<svg
			aria-hidden="true"
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Property</title>
			<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
			<path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		</svg>
	);
}

function DoorIcon(): React.ReactElement {
	return (
		<svg
			aria-hidden="true"
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke={MUTED_FG}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<title>Room</title>
			<path d="M10 21H2" />
			<path d="M10 3H7a2 2 0 0 0-2 2v16" />
			<path d="M14 12h.01" />
			<path d="M19 21V5a2 2 0 0 0-1.675-1.974l-6.163-1.013A1 1 0 0 0 10 3v18a1 1 0 0 0 1.124.992z" />
			<path d="M22 21h-3" />
		</svg>
	);
}

export function StatusPill({
	status,
}: {
	status: "paid" | "pending";
}): React.ReactElement {
	const paid = status === "paid";
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				borderRadius: PILL_RADIUS,
				border: `2px solid ${paid ? PAID_BORDER : PENDING_BORDER}`,
				padding: "6px 20px",
				fontFamily: FONT_SANS,
				fontSize: 32,
				fontWeight: 500,
				color: paid ? PAID : PENDING,
			}}
		>
			{paid ? "Paid" : "Pending"}
		</span>
	);
}

function NotRecordedPill(): React.ReactElement {
	return (
		<span
			style={{
				display: "inline-flex",
				alignItems: "center",
				borderRadius: PILL_RADIUS,
				border: `2px solid ${BORDER}`,
				padding: "6px 20px",
				fontFamily: FONT_SANS,
				fontSize: 32,
				fontWeight: 500,
				color: MUTED_FG,
			}}
		>
			Not recorded
		</span>
	);
}

export function RoomRow({
	room,
	statusOverride,
	amountOverride,
}: {
	room: OverviewRoom;
	statusOverride?: "paid" | "pending";
	amountOverride?: number;
}): React.ReactElement {
	const status = statusOverride ?? room.payment?.status ?? "none";
	const paid = room.payment !== null || statusOverride !== undefined;
	const amount =
		amountOverride ?? (paid ? room.total : (room.monthlyRent ?? 0));
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: 24,
				padding: "28px 32px",
				borderRadius: ROW_RADIUS,
				border: `2px solid ${BORDER}`,
				backgroundColor: CARD,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: ROW_RADIUS,
					backgroundColor: SECONDARY,
					width: 64,
					height: 64,
					flexShrink: 0,
				}}
			>
				<DoorIcon />
			</div>
			<span
				style={{
					fontFamily: FONT_SANS,
					fontSize: 44,
					fontWeight: 500,
					color: FG,
				}}
			>
				{room.name}
			</span>
			{status === "paid" || status === "pending" ? (
				<StatusPill status={status} />
			) : (
				<NotRecordedPill />
			)}
			<div style={{ flex: 1 }} />
			<span
				style={{
					fontFamily: FONT_SANS,
					fontSize: 44,
					fontWeight: 600,
					color: FG,
					flexShrink: 0,
				}}
			>
				{formatCurrency(amount, "en")}
			</span>
		</div>
	);
}

export function PageHeader({
	title,
	period,
}: {
	title: string;
	period: string;
}): React.ReactElement {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				gap: 32,
			}}
		>
			<span
				style={{
					fontFamily: FONT_SANS,
					fontSize: 64,
					fontWeight: 700,
					color: FG,
					margin: 0,
				}}
			>
				{title}
			</span>
			<span
				style={{
					border: `2px solid ${BORDER}`,
					borderRadius: CARD_RADIUS,
					padding: "12px 28px",
					fontFamily: FONT_SANS,
					fontSize: 36,
					fontWeight: 500,
					color: FG,
					backgroundColor: CARD,
				}}
			>
				{period}
			</span>
		</div>
	);
}

export function PropertyCard({
	name,
	paidCount,
	totalRooms,
	collected,
	children,
}: {
	name: string;
	paidCount: number;
	totalRooms: number;
	collected: React.ReactNode;
	children: React.ReactNode;
}): React.ReactElement {
	const isFullyPaid = paidCount === totalRooms;
	return (
		<div
			style={{
				borderRadius: CARD_RADIUS,
				border: `2px solid ${BORDER}`,
				backgroundColor: CARD,
				overflow: "hidden",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 24,
					padding: "32px 40px",
				}}
			>
				<ChevronIcon />
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						borderRadius: ROW_RADIUS,
						backgroundColor: isFullyPaid ? PAID_BG : PENDING_BG,
						width: 64,
						height: 64,
						flexShrink: 0,
					}}
				>
					<HomeIcon color={isFullyPaid ? PAID : PENDING} />
				</div>
				<span
					style={{
						fontFamily: FONT_SANS,
						fontSize: 44,
						fontWeight: 600,
						color: FG,
					}}
				>
					{name}
				</span>
				<span
					style={{
						display: "inline-flex",
						alignItems: "center",
						borderRadius: 999,
						border: `2px solid ${isFullyPaid ? PAID_BORDER : PENDING_BORDER}`,
						backgroundColor: isFullyPaid ? PAID_BG : PENDING_BG,
						padding: "6px 20px",
						fontFamily: FONT_SANS,
						fontSize: 32,
						fontWeight: 500,
						color: isFullyPaid ? PAID : PENDING,
						flexShrink: 0,
					}}
				>
					{paidCount}/{totalRooms} paid
				</span>
				<div style={{ flex: 1 }} />
				<div style={{ textAlign: "right", flexShrink: 0 }}>
					<p
						style={{
							fontFamily: FONT_SANS,
							fontSize: 44,
							fontWeight: 600,
							color: FG,
							margin: 0,
						}}
					>
						{collected}
					</p>
					<p
						style={{
							fontFamily: FONT_SANS,
							fontSize: 32,
							color: MUTED_FG,
							margin: "4px 0 0",
						}}
					>
						collected
					</p>
				</div>
			</div>
			<div
				style={{
					borderTop: `2px solid ${BORDER}`,
					padding: 32,
					display: "flex",
					flexDirection: "column",
					gap: 24,
				}}
			>
				{children}
			</div>
		</div>
	);
}
