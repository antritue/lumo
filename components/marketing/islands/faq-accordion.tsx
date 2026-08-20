"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FaqItem {
	question: string;
	answer: string;
}

interface FaqAccordionProps {
	items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
	const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

	const toggle = (index: number) => {
		setOpenIndices((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	};

	return (
		<div className="mx-auto max-w-3xl space-y-3">
			{items.map((item, index) => {
				const isOpen = openIndices.has(index);
				return (
					<div
						key={item.question}
						className="overflow-hidden rounded-xl border border-border bg-background"
					>
						<h3>
							<button
								type="button"
								aria-expanded={isOpen}
								aria-controls={`faq-panel-${index}`}
								onClick={() => toggle(index)}
								className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							>
								<span className="text-sm font-semibold text-foreground">
									{item.question}
								</span>
								<ChevronDown
									className={cn(
										"h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
										isOpen && "rotate-180",
									)}
								/>
							</button>
						</h3>
						{isOpen && (
							<section
								id={`faq-panel-${index}`}
								aria-label={item.question}
								className="px-6 pb-5 animate-in fade-in slide-in-from-top-2 duration-200"
							>
								<p className="text-sm text-muted-foreground leading-relaxed">
									{item.answer}
								</p>
							</section>
						)}
					</div>
				);
			})}
		</div>
	);
}
