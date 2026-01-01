import { CtaSection } from "@/components/cta-section";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Problems } from "@/components/problems";

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
