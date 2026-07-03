import { Sun } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { JoinWaitlistDialog } from "@/components/shared/join-waitlist-dialog";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export async function CtaSection() {
	const t = await getTranslations("cta");

	return (
		<Section variant="transparent" containerClassName="max-w-4xl">
			<div className="relative rounded-sm bg-secondary/60 border border-border/60 p-12 text-center overflow-hidden">
				<div className="relative z-10">
					<div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-accent/10 mb-6">
						<Sun className="h-7 w-7 text-accent" />
					</div>

					<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
						{t("title")}
					</h2>

					<p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
						{t("subtitle")}
					</p>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<JoinWaitlistDialog
							trigger={
								<Button size="lg" className="h-12 px-8">
									{t("button")}
								</Button>
							}
						/>
					</div>
				</div>
			</div>
		</Section>
	);
}
