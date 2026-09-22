import { interpolate, useCurrentFrame } from "remotion";
import { easings } from "../shared/easings";

export function MaskReveal({
	children,
	startFrame,
	duration = 20,
}: {
	children: React.ReactNode;
	startFrame: number;
	duration?: number;
}): React.ReactElement {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: easings.maskReveal,
	});
	return (
		<div
			style={{
				clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
				opacity: p === 0 ? 0 : 1,
			}}
		>
			{children}
		</div>
	);
}
