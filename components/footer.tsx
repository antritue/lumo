import { Sun, Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="py-12 border-t border-border bg-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Sun className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-semibold text-foreground">Lumo</span>
                    </div>

                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> for independent property owners.
                    </p>

                    <p className="text-xs text-muted-foreground/60">
                        © {new Date().getFullYear()} Lumo. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
