import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { Locale } from "@/lib/constants";
import { BG, FG, FONT_SANS, PRIMARY } from "../design-tokens";
import { MaskReveal } from "../primitives/MaskReveal";
import { getPromoCopy } from "../promo-copy";

export function Pain({
	locale = "en",
}: {
	locale?: Locale;
}): React.ReactElement {
	const frame = useCurrentFrame();
	const copy = getPromoCopy(locale);
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
				{copy.painEyebrow}
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
					{copy.painHeadline[0]}
					<br />
					{copy.painHeadline[1]}
				</div>
			</MaskReveal>
		</AbsoluteFill>
	);
}
