import { Sun } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PreviewCarousel } from "@/components/marketing/islands/preview-carousel";
import { JoinWaitlistDialog } from "@/components/shared/join-waitlist-dialog";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export async function Hero() {
	const t = await getTranslations("hero");

	return (
		<Section
			variant="transparent"
			className="relative overflow-hidden pt-16 sm:pt-24"
		>
			<div className="text-center w-full sm:w-160 lg:w-3xl mx-auto">
				<div className="mx-auto mb-10 w-12 h-0.5 bg-accent" />

				<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent-foreground text-sm font-medium rounded-sm mb-8 animate-in fade-in zoom-in duration-500">
					<Sun className="h-4 w-4 shrink-0" />
					<span>{t("badge")}</span>
				</div>

				<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
					{t("headline")}
				</h1>

				<p className="text-lg sm:text-xl text-muted-foreground max-w-160 mx-auto mb-10 text-balance animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
					{t("subtext")}
				</p>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
					<JoinWaitlistDialog
						trigger={
							<Button size="lg" className="h-12 px-8 text-base w-55">
								{t("cta")}
							</Button>
						}
					/>
				</div>

				<div className="mt-16 mx-auto w-full rounded-sm bg-white border border-border shadow-soft p-2 sm:p-4 animate-in fade-in zoom-in duration-1000 delay-500">
					<PreviewCarousel />
				</div>
			</div>
		</Section>
	);
}
