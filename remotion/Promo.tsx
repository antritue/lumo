import {
	AbsoluteFill,
	Html5Audio,
	interpolate,
	Sequence,
	staticFile,
} from "remotion";
import { BoardMini } from "./promo-scenes/BoardMini";
import { Finale } from "./promo-scenes/Finale";
import { Pain } from "./promo-scenes/Pain";
import { PaymentRecords } from "./promo-scenes/PaymentRecords";

export const VIDEO = {
	width: 1920,
	height: 1080,
	fps: 30,
	totalFrames: 690,
	scene1Start: 0,
	scene1Duration: 150,
	scene2Start: 150,
	scene2Duration: 270,
	scene3Start: 420,
	scene3Duration: 180,
	scene4Start: 600,
	scene4Duration: 90,
	// Sum: 150 + 270 + 180 + 90 = 690 (23s: Pain / Board 9s / Records 6s / Finale)
} as const;

export function Promo(): React.ReactElement {
	return (
		<AbsoluteFill>
			<Html5Audio
				src={staticFile("promo-track.mp3")}
				volume={(f) =>
					interpolate(
						f,
						[VIDEO.totalFrames - 18, VIDEO.totalFrames],
						[0.6, 0],
						{
							extrapolateLeft: "clamp",
							extrapolateRight: "clamp",
						},
					)
				}
			/>
			<Sequence
				from={VIDEO.scene1Start}
				durationInFrames={VIDEO.scene1Duration}
			>
				<Pain />
			</Sequence>
			<Sequence
				from={VIDEO.scene2Start}
				durationInFrames={VIDEO.scene2Duration}
			>
				<BoardMini />
			</Sequence>
			<Sequence
				from={VIDEO.scene3Start}
				durationInFrames={VIDEO.scene3Duration}
			>
				<PaymentRecords />
			</Sequence>
			<Sequence
				from={VIDEO.scene4Start}
				durationInFrames={VIDEO.scene4Duration}
			>
				<Finale />
			</Sequence>
		</AbsoluteFill>
	);
}
