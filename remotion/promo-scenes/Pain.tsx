import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BG, FG, FONT_SANS, PRIMARY } from "../design-tokens";
import { MaskReveal } from "../primitives/MaskReveal";

export function Pain(): React.ReactElement {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, 150], [1.0, 1.08], {
		extrapolateRight: "clamp",
	});
	return (
		<AbsoluteFill
			style={{
				backgroundColor: BG,
				justifyContent: "center",
				alignItems: "center",
				transform: `scale(${scale})`,
			}}
		>
			<div
				style={{
					fontFamily: FONT_SANS,
					fontWeight: 600,
					fontSize: 40,
					color: PRIMARY,
					marginBottom: 32,
				}}
			>
				For independent landlords
			</div>
			<MaskReveal startFrame={15}>
				<div
					style={{
						fontFamily: FONT_SANS,
						fontWeight: 800,
						fontSize: 110,
						color: FG,
						textAlign: "center",
						lineHeight: 1.05,
					}}
				>
					Still checking who paid
					<br />
					in spreadsheets?
				</div>
			</MaskReveal>
		</AbsoluteFill>
	);
}
