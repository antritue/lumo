import { Check } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

interface Tier {
	name: string;
	description: string;
	price: string;
	period: string;
	badge?: string;
	highlight?: boolean;
	accent?: boolean;
	cta: string;
	features: string[];
}

function TierCard({ tier }: { tier: Tier }) {
	return (
		<Card
			className={cn(
				"relative flex flex-col transition-all duration-300 hover:-translate-y-1",
				tier.highlight
					? "border-primary/30 bg-linear-to-b from-primary/5 to-transparent shadow-soft-lg"
					: tier.accent
						? "border-accent/40 bg-linear-to-b from-accent/10 to-transparent shadow-soft-lg"
						: "hover:shadow-soft-lg",
			)}
		>
			{tier.badge && (
				<div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
					<span
						className={cn(
							"inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm whitespace-nowrap",
							tier.highlight
								? "bg-primary text-primary-foreground"
								: tier.accent
									? "bg-accent text-accent-foreground"
									: "bg-primary/10 text-primary",
						)}
					>
						{tier.badge}
					</span>
				</div>
			)}
			<CardHeader className="pt-8 pb-5 text-center">
				<CardTitle className="text-xl">{tier.name}</CardTitle>
				{tier.description && (
					<p className="text-xs text-muted-foreground">{tier.description}</p>
				)}
			</CardHeader>
			<CardContent className="flex flex-1 flex-col px-6 pb-8">
				<div className="text-center">
					<span className="text-4xl font-bold text-foreground">
						{tier.price}
					</span>
					<span className="ml-1.5 text-sm text-muted-foreground">
						{tier.period}
					</span>
				</div>
				<ul className="mt-6 flex-1 space-y-3">
					{tier.features.map((feature) => (
						<li key={feature} className="flex items-center gap-2.5">
							<div
								className={cn(
									"flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
									tier.highlight
										? "bg-primary/20"
										: tier.accent
											? "bg-accent/20"
											: "bg-primary/10",
								)}
							>
								<Check
									className={cn(
										"h-3 w-3",
										tier.accent ? "text-accent-foreground" : "text-primary",
									)}
								/>
							</div>
							<span className="text-sm text-foreground/80">{feature}</span>
						</li>
					))}
				</ul>
				<Link href="/dashboard" target="_blank" className="mt-8 block">
					<Button
						variant={
							tier.highlight ? "default" : tier.accent ? "accent" : "outline"
						}
						size="lg"
						className="w-full"
					>
						{tier.cta}
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

export async function Pricing() {
	const t = await getTranslations("pricing");

	const tiers: Tier[] = [
		{
			name: t("tiers.free.name"),
			description: t("tiers.free.description"),
			price: t("tiers.free.price"),
			period: t("tiers.free.period"),
			features: t.raw("tiers.free.features") as string[],
			cta: t("tiers.free.cta"),
		},
		{
			name: t("tiers.monthly.name"),
			description: t("tiers.monthly.description"),
			price: t("tiers.monthly.price"),
			period: t("tiers.monthly.period"),
			features: t.raw("tiers.monthly.features") as string[],
			cta: t("tiers.monthly.cta"),
		},
		{
			name: t("tiers.yearly.name"),
			description: t("tiers.yearly.description"),
			price: t("tiers.yearly.price"),
			period: t("tiers.yearly.period"),
			badge: t("tiers.yearly.badge"),
			highlight: true,
			features: t.raw("tiers.yearly.features") as string[],
			cta: t("tiers.yearly.cta"),
		},
		{
			name: t("tiers.lifetime.name"),
			description: t("tiers.lifetime.description"),
			price: t("tiers.lifetime.price"),
			period: t("tiers.lifetime.period"),
			badge: t("tiers.lifetime.badge"),
			accent: true,
			features: t.raw("tiers.lifetime.features") as string[],
			cta: t("tiers.lifetime.cta"),
		},
	];

	return (
		<Section id="pricing" variant="secondary">
			<div className="mx-auto mb-16 max-w-2xl text-center">
				<h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl text-balance">
					{t("title")}
				</h2>
				<p className="text-lg text-muted-foreground">{t("subtitle")}</p>
			</div>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{tiers.map((tier) => (
					<TierCard key={tier.name} tier={tier} />
				))}
			</div>
		</Section>
	);
}
