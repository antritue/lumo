import {
	CalendarX,
	FileSpreadsheet,
	Lightbulb,
	StickyNote,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

interface ProblemItem {
	title: string;
	description: string;
}

export async function Problems() {
	const t = await getTranslations("problems");

	const icons = [CalendarX, FileSpreadsheet, StickyNote];
	const items = t.raw("items") as ProblemItem[];

	return (
		<Section variant="secondary">
			<div className="text-center mb-16">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
					{t("title")}
				</h2>
				<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
					{t("subtitle")}
				</p>
			</div>

			<div className="grid md:grid-cols-3 gap-8 mb-16">
				{items.map((item, index) => {
					const Icon = icons[index];
					return (
						<Card
							key={item.title}
							className="group bg-white/80 backdrop-blur-sm border-transparent hover:border-border hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
						>
							<CardContent className="p-8 text-center">
								<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary mx-auto group-hover:scale-110 transition-transform duration-300">
									<Icon className="h-6 w-6" />
								</div>
								<h3 className="text-xl font-semibold mb-3">{item.title}</h3>
								<p className="text-muted-foreground">{item.description}</p>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Solution */}
			<div className="max-w-2xl mx-auto text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
					<Lightbulb className="h-8 w-8 text-primary" />
				</div>
				<h3 className="text-2xl font-bold text-foreground mb-4">
					{t("solution.title")}
				</h3>
				<p className="text-lg text-muted-foreground">
					{t("solution.description")}
				</p>
			</div>
		</Section>
	);
}
