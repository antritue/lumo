import type { MetadataRoute } from "next";
import { locales } from "@/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.lumo.homes";

	const routes = [""].flatMap((route) =>
		locales.map((locale) => ({
			url: `${baseUrl}/${locale}${route}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: route === "" ? 1 : 0.8,
		})),
	);

	return routes;
}
