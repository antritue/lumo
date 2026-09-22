import { interpolate, useCurrentFrame } from "remotion";
import { FG, FONT_SANS } from "../design-tokens";

export function Caption({
	text,
	showFrom = 15,
	showUntil = 105,
}: {
	text: string;
	showFrom?: number;
	showUntil?: number;
}): React.ReactElement {
	const frame = useCurrentFrame();
	const opacity = interpolate(
		frame,
		[showFrom, showFrom + 12, showUntil - 12, showUntil],
		[0, 1, 1, 0],
		{ extrapolateLeft: "clamp", extrapolateRight: "clamp" },
	);
	return (
		<div
			style={{
				position: "absolute",
				bottom: 64,
				left: 0,
				right: 0,
				textAlign: "center",
				fontFamily: FONT_SANS,
				fontSize: 36,
				fontWeight: 500,
				color: FG,
				opacity,
			}}
		>
			{text}
		</div>
	);
}
