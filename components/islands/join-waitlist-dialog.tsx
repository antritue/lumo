"use client";

import { FormEvent, ReactNode, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sun } from "lucide-react";

interface JoinWaitlistDialogProps {
    children?: ReactNode;
    trigger?: ReactNode;
}

export function JoinWaitlistDialog({ children, trigger }: JoinWaitlistDialogProps) {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setEmail("");
                setOpen(false);
            }, 2000);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Sun className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center">Lumo is not ready yet</DialogTitle>
                    <DialogDescription className="text-center">
                        {submitted ? (
                            <span className="text-primary font-medium">Thanks! We will be in touch soon.</span>
                        ) : (
                            <>
                                <span className="block mb-1">We are working hard to build something special.</span>
                                <span>Leave your email to be notified when we launch.</span>
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {!submitted && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                            Notify Me
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            We respect your privacy. No spam, ever.
                        </p>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
