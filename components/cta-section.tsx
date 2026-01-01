import { ArrowRight, Sun } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { JoinWaitlistDialog } from "@/components/islands/join-waitlist-dialog";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export async function CtaSection() {
	const t = await getTranslations("cta");

	return (
		<Section variant="transparent" containerClassName="max-w-4xl">
			<div className="relative rounded-3xl bg-linear-to-br from-primary/10 via-accent/5 to-secondary p-12 text-center overflow-hidden">
				{/* Decorative */}
				<div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />

				<div className="relative z-10">
					<div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-sm mb-6">
						<Sun className="h-7 w-7 text-primary" />
					</div>

					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
						{t("title")}
					</h2>

					<p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
						{t("subtitle")}
					</p>

					<JoinWaitlistDialog
						trigger={
							<Button size="lg" className="h-12 px-8">
								{t("button")}
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						}
					/>
				</div>
			</div>
		</Section>
	);
}
