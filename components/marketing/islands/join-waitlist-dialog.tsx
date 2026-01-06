"use client";

import { Loader2, Mail, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, type ReactNode, useState } from "react";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface JoinWaitlistDialogProps {
	children?: ReactNode;
	trigger?: ReactNode;
}

export function JoinWaitlistDialog({
	children,
	trigger,
}: JoinWaitlistDialogProps) {
	const t = useTranslations("waitlist");
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [open, setOpen] = useState(false);

	const [loading, setLoading] = useState(false);

	const [errorOpen, setErrorOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!email) return;

		setLoading(true);

		try {
			const response = await fetch("/api/waitlist", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || t("error"));
			}

			setSubmitted(true);
		} catch (err) {
			const message = err instanceof Error ? err.message : t("error");
			setErrorMessage(message);
			setErrorOpen(true);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(val) => {
					setOpen(val);
					if (!val) {
						// Reset state when closing
						setSubmitted(false);
						setEmail("");
					}
				}}
			>
				<DialogTrigger asChild>{trigger || children}</DialogTrigger>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Sun className="h-6 w-6 text-primary" />
						</div>
						<DialogTitle className="text-center">{t("title")}</DialogTitle>
						<DialogDescription className="text-center">
							{submitted ? (
								<span className="text-primary font-medium">{t("success")}</span>
							) : (
								t("description")
							)}
						</DialogDescription>
					</DialogHeader>

					{!submitted ? (
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									type="email"
									placeholder={t("emailPlaceholder")}
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								size="lg"
								disabled={loading}
							>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t("submit")}...
									</>
								) : (
									t("submit")
								)}
							</Button>
						</form>
					) : (
						<div className="flex justify-center pt-2">
							<Button
								variant="default"
								className="w-full"
								onClick={() => setOpen(false)}
							>
								OK
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<ErrorDialog
				open={errorOpen}
				onOpenChange={setErrorOpen}
				description={errorMessage}
			/>
		</>
	);
}
