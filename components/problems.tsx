import { CalendarX, FileSpreadsheet, StickyNote, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function Problems() {
    const problems = [
        {
            icon: CalendarX,
            title: "Forgetting rent dates",
            description: "Missing payments because there's no easy way to track who paid and when"
        },
        {
            icon: FileSpreadsheet,
            title: "Messy spreadsheets",
            description: "Excel files that grow confusing over time, with formulas breaking unexpectedly"
        },
        {
            icon: StickyNote,
            title: "Paper notes everywhere",
            description: "Scattered notebooks and sticky notes that are easy to lose or misplace"
        }
    ];

    return (
        <section className="py-24 bg-secondary/30">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        We understand your challenges
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Managing rentals shouldn&apos;t feel overwhelming
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {problems.map((problem, index) => (
                        <Card
                            key={index}
                            className="group hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
                        >
                            <CardContent className="p-8 text-center">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary mx-auto group-hover:scale-110 transition-transform duration-300">
                                    <problem.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                                <p className="text-muted-foreground">
                                    {problem.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
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
                        Lumo is purpose-built for individual landlords. It&apos;s calm, simple, and helps you stay on top of your rentals without the complexity
                    </p>
                </div>
            </div>
        </section>
    );
}
