import { CalendarX, FileSpreadsheet, StickyNote, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Problems() {
    return (
        <section className="py-24 bg-secondary/30">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        We understand your challenges
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Managing rentals shouldn&apos;t feel overwhelming.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <Card className="bg-white/80 backdrop-blur-sm border-transparent hover:border-border transition-colors">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-6 text-red-600">
                                <CalendarX className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Forgetting rent dates</h3>
                            <p className="text-muted-foreground">
                                Missing payments because there&apos;s no easy way to track who paid and when.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-transparent hover:border-border transition-colors">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6 text-orange-600">
                                <FileSpreadsheet className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Messy spreadsheets</h3>
                            <p className="text-muted-foreground">
                                Excel files that grow confusing over time, with formulas breaking unexpectedly.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-transparent hover:border-border transition-colors">
                        <CardContent className="p-8">
                            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-6 text-yellow-600">
                                <StickyNote className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Paper notes everywhere</h3>
                            <p className="text-muted-foreground">
                                Scattered notebooks and sticky notes that are easy to lose or misplace.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Solution */}
                <div className="max-w-2xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                        There&apos;s a simpler way
                    </h3>
                    <p className="text-lg text-muted-foreground">
                        Lumo is purpose-built for individual landlords. It&apos;s calm, simple, and helps you stay on top of your rentals without the complexity.
                    </p>
                </div>
            </div>
        </section>
    );
}
