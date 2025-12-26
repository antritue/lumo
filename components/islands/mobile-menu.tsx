"use client";

import { ReactNode, useState } from "react";

import { Menu, X } from "lucide-react";


interface MobileMenuProps {
    waitlistTrigger: ReactNode;
}

export function MobileMenu({ waitlistTrigger }: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
            >
                {open ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-16 bg-background/95 backdrop-blur-md border-b border-border shadow-soft-lg p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex flex-col gap-4">
                        <a
                            href="#features"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground px-2 py-2 rounded-md hover:bg-secondary"
                            onClick={() => setOpen(false)}
                        >
                            Features
                        </a>
                        <a
                            href="#pricing"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground px-2 py-2 rounded-md hover:bg-secondary"
                            onClick={() => setOpen(false)}
                        >
                            Pricing
                        </a>
                        <div className="pt-2 flex flex-col gap-2">
                            {waitlistTrigger}
                            <div onClick={() => setOpen(false)}>
                                {/* Re-render trigger isn't ideal but simplest for this island pattern. 
                     Ideally pass a specialized component. 
                     For now, assumption is passed trigger is a JoinWaitlistDialog wrapping a Button
                 */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
