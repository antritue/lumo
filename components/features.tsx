import { Home, CreditCard, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Features() {
    const features = [
        {
            icon: Home,
            title: "Track rooms & tenants",
            description: "See all your rooms and who's renting them in one simple view.",
            color: "bg-blue-100 text-blue-600",
        },
        {
            icon: CreditCard,
            title: "See payment status clearly",
            description: "Know instantly who has paid and who hasn't — no digging through files.",
            color: "bg-green-100 text-green-600",
        },
        {
            icon: Heart,
            title: "Built for you, not companies",
            description: "Designed for individual landlords, not property management companies.",
            color: "bg-pink-100 text-pink-600",
        },
    ];

    return (
        <section id="features" className="py-24 scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Everything you need, nothing you don&apos;t
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Simple tools designed for real landlords.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="group hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <CardContent className="p-8 text-center">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="h-8 w-8" strokeWidth={1.5} />
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
            </div>
        </section>
    );
}
