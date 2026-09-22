import { interpolate, useCurrentFrame } from "remotion";
import { formatCurrency } from "@/lib/utils";

export function Counter({
	from,
	to,
	startFrame,
	duration = 45,
}: {
	from: number;
	to: number;
	startFrame: number;
	duration?: number;
}): React.ReactElement {
	const frame = useCurrentFrame();
	const value = Math.round(
		interpolate(frame, [startFrame, startFrame + duration], [from, to], {
			extrapolateLeft: "clamp",
			extrapolateRight: "clamp",
		}),
	);
	return <span>{formatCurrency(value, "en")}</span>;
}
