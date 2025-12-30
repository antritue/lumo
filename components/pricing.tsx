import { Check } from "lucide-react";
import { JoinWaitlistDialog } from "@/components/islands/join-waitlist-dialog";
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

export function Pricing() {
	const tiers: Tier[] = [
		{
			name: "Free",
			description: "Try the basics",
			price: "$0",
			features: [
				"Track one room",
				"Basic payment tracking",
				"Simple dashboard",
			],
			buttonText: "Get Started Free",
			buttonVariant: "outline",
		},
		{
			name: "Pro",
			description: "Unlimited rooms, future features",
			price: "—",
			features: ["Unlimited rooms", "Payment reminders", "Priority support"],
			buttonText: "Join Waitlist",
			buttonVariant: "default",
			isComingSoon: true,
			isPopular: true,
		},
	];

	return (
		<Section id="pricing" variant="secondary">
			<div className="text-center mb-16">
				<h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
					Simple, honest pricing
				</h2>
				<p className="text-lg text-muted-foreground">
					Pricing will be announced soon
				</p>
			</div>

			<div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
				{tiers.map((tier) => (
					<Card
						key={tier.name}
						className={cn(
							"relative group hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300",
							tier.isPopular &&
								"border-primary/20 bg-linear-to-b from-primary/5 to-transparent",
						)}
					>
						{tier.isComingSoon && (
							<div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
								<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-sm">
									Coming Soon
								</span>
							</div>
						)}
						<CardHeader
							className={cn("text-center pb-4", tier.isPopular && "pt-8")}
						>
							<CardTitle className="text-2xl">{tier.name}</CardTitle>
							<CardDescription>{tier.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-center mb-6">
								<span className="text-4xl font-bold text-foreground">
									{tier.price}
								</span>
								{/* <span className="text-muted-foreground">/month</span> */}
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

							<JoinWaitlistDialog
								trigger={
									<Button variant={tier.buttonVariant} className="w-full">
										{tier.buttonText}
									</Button>
								}
							/>
						</CardContent>
					</Card>
				))}
			</div>
		</Section>
	);
}
