"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

const PREVIEWS = [
	{ src: "/preview-properties.png", altKey: "previewProperties" },
	{ src: "/preview-room.png", altKey: "previewRoom" },
] as const;

export function PreviewCarousel() {
	const t = useTranslations("hero");
	const [activeIndex, setActiveIndex] = useState(0);

	return (
		<div className="relative">
			{/* Image Container */}
			<div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted/30">
				{PREVIEWS.map((preview, index) => (
					<div
						key={preview.src}
						className={`absolute inset-0 transition-opacity duration-300 ${
							index === activeIndex ? "opacity-100" : "opacity-0"
						}`}
						aria-hidden={index !== activeIndex}
					>
						<Image
							src={preview.src}
							alt={t(preview.altKey)}
							fill
							className="object-cover object-top"
							sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 768px"
							priority={index === 0}
						/>
					</div>
				))}
			</div>

			{/* Dot Navigation */}
			<div
				className="flex items-center justify-center gap-2 mt-4"
				role="tablist"
				aria-label={t("carouselLabel")}
			>
				{PREVIEWS.map((preview, index) => (
					<button
						key={preview.src}
						type="button"
						role="tab"
						aria-selected={index === activeIndex}
						aria-label={t(preview.altKey)}
						onClick={() => setActiveIndex(index)}
						className={`w-2 h-2 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
							index === activeIndex
								? "bg-foreground"
								: "bg-border hover:bg-muted-foreground/50"
						}`}
					/>
				))}
			</div>
		</div>
	);
}
