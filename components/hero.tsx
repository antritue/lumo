import { ArrowRight, Sun } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { JoinWaitlistDialog } from "@/components/islands/join-waitlist-dialog";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export async function Hero() {
	const t = await getTranslations("hero");

	return (
		<Section
			variant="transparent"
			className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden px-0 py-0"
		>
			{/* Decorative Background Elements */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-60" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-60" />
			</div>

			<div className="text-center">
				{/* Badge */}
				<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-8 animate-in fade-in zoom-in duration-500">
					<Sun className="h-4 w-4 text-primary" />
					<span className="text-sm font-medium text-primary">{t("badge")}</span>
				</div>

				{/* Headline */}
				<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
					{t("headline")}
				</h1>

				{/* Subtext */}
				<p className="whitespace-pre-line text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
					{t("subtext")}
				</p>

				{/* CTAs */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
					<Link href="/app" target="_blank">
						<Button size="lg" className="h-12 px-8 text-base">
							{t("launchApp")}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
					</Link>
					<JoinWaitlistDialog
						trigger={
							<Button
								size="lg"
								variant="outline"
								className="h-12 px-8 text-base"
							>
								{t("cta")}
							</Button>
						}
					/>
				</div>

				{/* Preview UI */}
				<div className="mt-16 mx-auto max-w-3xl rounded-2xl bg-white border border-border shadow-soft-lg p-2 sm:p-4 animate-in fade-in zoom-in duration-1000 delay-500">
					<div className="rounded-xl bg-muted/30 p-8 min-h-[300px] flex items-center justify-center border border-dashed border-border">
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
								<Sun className="h-8 w-8 text-primary" />
							</div>
							<p className="text-muted-foreground font-medium">
								{t("preview")}
							</p>
						</div>
					</div>
				</div>
			</div>
		</Section>
	);
}
