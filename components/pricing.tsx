import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JoinWaitlistDialog } from "@/components/islands/join-waitlist-dialog";

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-secondary/30 scroll-mt-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Simple, honest pricing
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Pricing will be announced soon.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Free Tier */}
                    <Card className="hover:shadow-soft-lg transition-all duration-300">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-2xl">Free</CardTitle>
                            <CardDescription>Try the basics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <span className="text-4xl font-bold text-foreground">$0</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {["Track up to 3 rooms", "Basic payment tracking", "Simple dashboard"].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <Check className="h-3.5 w-3.5 text-green-600" />
                                        </div>
                                        <span className="text-sm text-foreground/80">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <JoinWaitlistDialog
                                trigger={
                                    <Button variant="outline" className="w-full">
                                        Get Started Free
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>

                    {/* Pro Tier */}
                    <Card className="relative hover:shadow-soft-lg transition-all duration-300 border-primary/20 bg-linear-to-b from-primary/5 to-transparent">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-sm">
                                Coming Soon
                            </span>
                        </div>
                        <CardHeader className="text-center pb-4 pt-8">
                            <CardTitle className="text-2xl">Pro</CardTitle>
                            <CardDescription>Unlimited rooms, future features</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center mb-6">
                                <span className="text-4xl font-bold text-foreground">—</span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {["Unlimited rooms", "Payment reminders", "Export reports", "Priority support"].map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="text-sm text-foreground/80">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <JoinWaitlistDialog
                                trigger={
                                    <Button className="w-full">
                                        Join Waitlist
                                    </Button>
                                }
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
