import { interpolate, useCurrentFrame } from "remotion";
import { easings } from "../shared/easings";

export function PopIn({
	children,
	startFrame,
	duration = 18,
}: {
	children: React.ReactNode;
	startFrame: number;
	duration?: number;
}): React.ReactElement {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
		extrapolateLeft: "clamp",
		extrapolateRight: "clamp",
		easing: easings.slowInLand,
	});
	return (
		<div
			style={{
				opacity: p,
				transform: `translateY(${(1 - p) * 24}px) scale(${0.96 + p * 0.04})`,
			}}
		>
			{children}
		</div>
	);
}
