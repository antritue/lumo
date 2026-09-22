import { useVideoConfig } from "remotion";

export function Cursor({
	x,
	y,
	scale = 1,
}: {
	x: number;
	y: number;
	scale?: number;
}): React.ReactElement {
	const { width, height } = useVideoConfig();
	return (
		<div
			style={{
				position: "absolute",
				left: (x / 1920) * width,
				top: (y / 1080) * height,
				transform: `translate(-4px, -4px) scale(${scale})`,
				pointerEvents: "none",
				filter: "drop-shadow(0 4px 10px rgba(28,36,32,0.35))",
			}}
		>
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="#FFFFFF"
				stroke="#1C2420"
				strokeWidth="1.5"
				strokeLinejoin="round"
			>
				<title>Cursor</title>
				<path d="M5 3l14 7-6.5 1.5L9 18z" />
			</svg>
		</div>
	);
}
