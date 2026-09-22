import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BG, FONT_SANS } from "../design-tokens";
import { easings } from "../shared/easings";

function blendCreamToPine(t: number): string {
	const from = [250, 250, 248];
	const to = [28, 36, 32];
	const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
	return `rgb(${mix(from[0], to[0])},${mix(from[1], to[1])},${mix(from[2], to[2])})`;
}

export function Finale(): React.ReactElement {
	const frame = useCurrentFrame();
	const blend = interpolate(frame, [0, 15], [0, 1], {
		extrapolateRight: "clamp",
		easing: easings.soft,
	});
	const rise = interpolate(frame, [5, 35], [28, 0], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: easings.soft,
	});
	const contentOpacity = interpolate(frame, [5, 25], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
	});
	const glow = interpolate(frame, [10, 70], [0, 1], {
		extrapolateRight: "clamp",
		easing: easings.soft,
	});
	const drift = interpolate(frame, [0, 90], [1.0, 1.03], {
		extrapolateRight: "clamp",
	});
	return (
		<AbsoluteFill
			style={{
				backgroundColor: blendCreamToPine(blend),
				justifyContent: "center",
				alignItems: "center",
				transform: `scale(${drift})`,
			}}
		>
			<div
				style={{
					position: "absolute",
					width: 1100,
					height: 1100,
					borderRadius: "50%",
					background:
						"radial-gradient(circle, rgba(78,124,91,0.45) 0%, rgba(78,124,91,0) 65%)",
					opacity: glow,
				}}
			/>
			<div
				style={{
					transform: `translateY(${rise}px)`,
					opacity: contentOpacity,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 32,
				}}
			>
				<div
					style={{
						fontFamily: FONT_SANS,
						fontWeight: 800,
						fontSize: 104,
						color: BG,
						textAlign: "center",
						lineHeight: 1.05,
						whiteSpace: "nowrap",
					}}
				>
					Track rent with clarity
				</div>
				<div
					style={{
						fontFamily: FONT_SANS,
						fontWeight: 600,
						fontSize: 54,
						color: BG,
						textAlign: "center",
					}}
				>
					Try Lumo today
				</div>
			</div>
		</AbsoluteFill>
	);
}
