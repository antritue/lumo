import { getTranslations } from "next-intl/server";
import { FaqAccordion } from "@/components/marketing/islands/faq-accordion";
import { Section } from "@/components/ui/section";

interface FaqItem {
	question: string;
	answer: string;
}

export async function Faq() {
	const t = await getTranslations("faq");
	const items = t.raw("items") as FaqItem[];

	return (
		<Section id="faq" variant="secondary">
			<div className="mx-auto mb-16 max-w-2xl text-center">
				<h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl text-balance">
					{t("title")}
				</h2>
				<p className="text-lg text-muted-foreground">{t("subtitle")}</p>
			</div>

			<FaqAccordion items={items} />
		</Section>
	);
}
