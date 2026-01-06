import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { JoinWaitlistDialog } from "@/components/marketing/islands/join-waitlist-dialog";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

interface Tier {
	name: string;
	description: string;
	price: string;
	features: string[];
	buttonText: string;
	buttonVariant: "default" | "outline";
	isComingSoon?: boolean;
	isPopular?: boolean;
}

export async function Pricing() {
	const t = await getTranslations("pricing");

	const tiers: Tier[] = [
		{
			name: t("tiers.free.name"),
			description: t("tiers.free.description"),
			price: t("tiers.free.price"),
			features: t.raw("tiers.free.features") as string[],
			buttonText: t("tiers.free.buttonText"),
			buttonVariant: "outline",
		},
		{
			name: t("tiers.pro.name"),
			description: t("tiers.pro.description"),
			price: t("tiers.pro.price"),
			features: t.raw("tiers.pro.features") as string[],
			buttonText: t("tiers.pro.buttonText"),
			buttonVariant: "default",
			isComingSoon: true,
			isPopular: true,
		},
	];

	return (
		<Section id="pricing" variant="secondary">
			<div className="text-center mb-16">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
					{t("title")}
				</h2>
				<p className="text-lg text-muted-foreground">{t("subtitle")}</p>
			</div>

			<div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
				{tiers.map((tier) => (
					<Card
						key={tier.name}
						className={cn(
							"relative group hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col",
							tier.isPopular &&
								"border-primary/20 bg-linear-to-b from-primary/5 to-transparent",
						)}
					>
						{tier.isComingSoon && (
							<div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
								<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-sm">
									{t("comingSoon")}
								</span>
							</div>
						)}
						<CardHeader className="text-center pb-4 pt-8">
							<CardTitle className="text-2xl">{tier.name}</CardTitle>
							<CardDescription>{tier.description}</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col flex-1">
							<div className="text-center mb-6">
								<span className="text-4xl font-bold text-foreground">
									{tier.price}
								</span>
							</div>
							<ul className="space-y-4 mb-8">
								{tier.features.map((feature) => (
									<li key={feature} className="flex items-center gap-3">
										<div
											className={cn(
												"w-6 h-6 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300",
												tier.isPopular ? "bg-primary/20" : "bg-green-100",
											)}
										>
											<Check
												className={cn(
													"h-3.5 w-3.5",
													tier.isPopular ? "text-primary" : "text-green-600",
												)}
											/>
										</div>
										<span className="text-sm text-foreground/80">
											{feature}
										</span>
									</li>
								))}
							</ul>

							<div className="mt-auto">
								<JoinWaitlistDialog
									trigger={
										<Button variant={tier.buttonVariant} className="w-full">
											{tier.buttonText}
										</Button>
									}
								/>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</Section>
	);
}
