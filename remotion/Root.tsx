import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { Composition } from "remotion";
import { Promo, VIDEO } from "./Promo";
import { BoardMini } from "./promo-scenes/BoardMini";
import { Finale } from "./promo-scenes/Finale";
import { Pain } from "./promo-scenes/Pain";
import { PaymentRecords } from "./promo-scenes/PaymentRecords";

loadInter("normal", {
	weights: ["400", "500", "600", "700", "800"],
	subsets: ["latin", "vietnamese"],
});

export function RemotionRoot(): React.ReactElement {
	return (
		<>
			<Composition
				id="Promo"
				component={Promo}
				defaultProps={{ locale: "en" }}
				durationInFrames={VIDEO.totalFrames}
				fps={VIDEO.fps}
				width={VIDEO.width}
				height={VIDEO.height}
			/>
			<Composition
				id="PromoVi"
				component={Promo}
				defaultProps={{ locale: "vi" }}
				durationInFrames={VIDEO.totalFrames}
				fps={VIDEO.fps}
				width={VIDEO.width}
				height={VIDEO.height}
			/>
			<Composition
				id="promo-Scene01"
				component={Pain}
				defaultProps={{ locale: "en" }}
				durationInFrames={VIDEO.scene1Duration}
				fps={VIDEO.fps}
				width={VIDEO.width}
				height={VIDEO.height}
			/>
			<Composition
				id="promo-Scene02"
				component={BoardMini}
				defaultProps={{ locale: "en" }}
				durationInFrames={VIDEO.scene2Duration}
				fps={VIDEO.fps}
				width={VIDEO.width}
				height={VIDEO.height}
			/>
			<Composition
				id="promo-Scene03"
				component={PaymentRecords}
				defaultProps={{ locale: "en" }}
				durationInFrames={VIDEO.scene3Duration}
				fps={VIDEO.fps}
				width={VIDEO.width}
				height={VIDEO.height}
			/>
			<Composition
				id="promo-Scene04"
				component={Finale}
				defaultProps={{ locale: "en" }}
				durationInFrames={VIDEO.scene4Duration}
				fps={VIDEO.fps}
				width={VIDEO.width}
				height={VIDEO.height}
			/>
		</>
	);
}
