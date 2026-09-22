import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { formatCurrency } from "@/lib/utils";
import {
	BG,
	BORDER,
	CARD,
	CARD_RADIUS,
	FG,
	FONT_SANS,
	MUTED_FG,
	ROW_RADIUS,
} from "../design-tokens";
import { PopIn } from "../primitives/PopIn";
import { Caption } from "../shared/caption";
import {
	ChevronIcon,
	ChevronRightIcon,
	StatusPill,
	snapshot,
} from "../shared/property-card";

const SHOWN_CHARGE_IDS = [
	"demo-svc-elec-a",
	"demo-svc-water-a",
	"demo-svc-clean-a",
];

function formatPeriod(period: string): string {
	const [year, month] = period.split("-");
	return `${month}-${year}`;
}

function prevPeriod(period: string): string {
	const [y, m] = period.split("-").map(Number);
	const d = new Date(y, m - 2, 1);
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	return `${d.getFullYear()}-${mm}`;
}

const ICON_BOX: React.CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	borderRadius: ROW_RADIUS,
	backgroundColor: "rgba(242,244,242,0.6)",
	width: 64,
	height: 64,
	flexShrink: 0,
};

export function PaymentRecords(): React.ReactElement {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 150], [1.08, 1.0], {
		extrapolateRight: "clamp",
	});
	const room =
		snapshot.rooms.find((r) => r.charges.length > 0) ?? snapshot.rooms[0];
	const rent = room.payment?.rentAmount ?? room.monthlyRent ?? 0;
	const charges = room.charges.filter((c) =>
		SHOWN_CHARGE_IDS.includes(c.serviceId),
	);
	const serviceTotal = charges.reduce((sum, c) => sum + c.total, 0);
	const currentTotal = rent + serviceTotal;
	const lastPeriod = prevPeriod(snapshot.period);
	return (
		<AbsoluteFill
			style={{ backgroundColor: BG, padding: 120, justifyContent: "center" }}
		>
			<div
				style={{
					transform: `scale(${scale})`,
					display: "flex",
					flexDirection: "column",
					gap: 32,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "baseline",
						gap: 24,
					}}
				>
					<span
						style={{
							fontFamily: FONT_SANS,
							fontSize: 60,
							fontWeight: 800,
							color: FG,
						}}
					>
						{room.name}
					</span>
					<span
						style={{
							fontFamily: FONT_SANS,
							fontSize: 36,
							color: MUTED_FG,
						}}
					>
						Payment records
					</span>
				</div>
				<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
					<div
						style={{
							borderRadius: CARD_RADIUS,
							border: `2px solid ${BORDER}`,
							backgroundColor: CARD,
							overflow: "hidden",
						}}
					>
						<PopIn startFrame={10}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: 24,
									padding: "28px 32px",
								}}
							>
								<div style={ICON_BOX}>
									<ChevronIcon />
								</div>
								<span
									style={{
										fontFamily: FONT_SANS,
										fontSize: 44,
										fontWeight: 500,
										color: FG,
									}}
								>
									{formatPeriod(snapshot.period)}
								</span>
								<StatusPill status="pending" />
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
										{formatCurrency(currentTotal, "en")}
									</p>
									<p
										style={{
											fontFamily: FONT_SANS,
											fontSize: 30,
											color: MUTED_FG,
											margin: "4px 0 0",
										}}
									>
										inc. services
									</p>
								</div>
							</div>
						</PopIn>
						<div
							style={{
								margin: "0 32px 32px",
								border: `2px solid ${BORDER}`,
								borderRadius: CARD_RADIUS,
								backgroundColor: "rgba(242,244,242,0.35)",
								padding: "24px 32px",
								display: "flex",
								flexDirection: "column",
								gap: 20,
							}}
						>
							<PopIn startFrame={30}>
								<div
									style={{
										display: "flex",
										fontFamily: FONT_SANS,
										fontSize: 40,
										color: FG,
									}}
								>
									<span style={{ color: MUTED_FG }}>Rent</span>
									<span style={{ flex: 1 }} />
									<span style={{ fontWeight: 600 }}>
										{formatCurrency(rent, "en")}
									</span>
								</div>
							</PopIn>
							{charges.map((c, i) => (
								<PopIn key={c.serviceId} startFrame={45 + i * 15}>
									<div
										style={{
											display: "flex",
											fontFamily: FONT_SANS,
											fontSize: 40,
											color: FG,
										}}
									>
										<span style={{ color: MUTED_FG }}>
											{c.serviceName}
											{c.pricingType === "variable" && c.usage != null && (
												<span style={{ fontSize: 30 }}>
													{" "}
													({c.usage} {c.unitLabel ?? ""} ×{" "}
													{formatCurrency(c.unitPrice ?? 0, "en")})
												</span>
											)}
										</span>
										<span style={{ flex: 1 }} />
										<span style={{ fontWeight: 600 }}>
											{formatCurrency(c.total, "en")}
										</span>
									</div>
								</PopIn>
							))}
						</div>
					</div>
					<PopIn startFrame={25}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 24,
								padding: "28px 32px",
								borderRadius: CARD_RADIUS,
								border: `2px solid ${BORDER}`,
								backgroundColor: CARD,
							}}
						>
							<div style={ICON_BOX}>
								<ChevronRightIcon />
							</div>
							<span
								style={{
									fontFamily: FONT_SANS,
									fontSize: 44,
									fontWeight: 500,
									color: FG,
								}}
							>
								{formatPeriod(lastPeriod)}
							</span>
							<StatusPill status="paid" />
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
								{formatCurrency(rent, "en")}
							</span>
						</div>
					</PopIn>
				</div>
			</div>
			<Caption
				text="Service charges calculated into the rent total"
				showFrom={15}
				showUntil={165}
			/>
		</AbsoluteFill>
	);
}
