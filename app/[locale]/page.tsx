import { CtaSection } from "@/components/marketing/cta-section";
import { Features } from "@/components/marketing/features";
import { Footer } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";
import { Pricing } from "@/components/marketing/pricing";
import { Problems } from "@/components/marketing/problems";

export default async function Home() {
	return (
		<main className="flex min-h-screen flex-col">
			<Header />
			<Hero />
			<Problems />
			<Features />
			<Pricing />
			<CtaSection />
			<Footer />
		</main>
	);
}
