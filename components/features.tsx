import { CreditCard, Heart, Home } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

interface FeatureItem {
	title: string;
	description: string;
}

export async function Features() {
	const t = await getTranslations("features");

	const icons = [Home, CreditCard, Heart];
	const items = t.raw("items") as FeatureItem[];

	return (
		<Section id="features">
			<div className="text-center mb-16">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
					{t("title")}
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					{t("subtitle")}
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				{items.map((item, index) => {
					const Icon = icons[index];
					return (
						<Card
							key={item.title}
							className="group hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
						>
							<CardContent className="p-8 text-center">
								<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-300 mx-auto">
									<Icon className="h-6 w-6" />
								</div>
								<h3 className="text-xl font-semibold text-foreground mb-3">
									{item.title}
								</h3>
								<p className="text-muted-foreground leading-relaxed">
									{item.description}
								</p>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</Section>
	);
}
