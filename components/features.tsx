import { CreditCard, Heart, Home, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

interface Feature {
	icon: LucideIcon;
	title: string;
	description: string;
}

export function Features() {
	const features: Feature[] = [
		{
			icon: Home,
			title: "Track rooms & tenants",
			description:
				"See all your rooms and who's renting them in one simple view",
		},
		{
			icon: CreditCard,
			title: "See payment status clearly",
			description:
				"Know instantly who has paid and who hasn't. No digging through files",
		},
		{
			icon: Heart,
			title: "Built for you, not companies",
			description:
				"Designed for property owners, not property management companies",
		},
	];

	return (
		<Section id="features">
			<div className="text-center mb-16">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
					Everything you need, nothing you don&apos;t
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					Simple tools designed for managing your rentals
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				{features.map((feature) => (
					<Card
						key={feature.title}
						className="group hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
					>
						<CardContent className="p-8 text-center">
							<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300 mx-auto">
								<feature.icon className="h-6 w-6" />
							</div>
							<h3 className="text-xl font-semibold text-foreground mb-3">
								{feature.title}
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								{feature.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</Section>
	);
}
