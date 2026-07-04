"use client";

import { Info, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const FEEDBACK_TYPES = ["bug", "feature", "other"] as const;
type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export default function FeedbackPage() {
	const t = useTranslations("app.feedback");
	const user = useAuthStore((state) => state.user);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [type, setType] = useState<FeedbackType>("bug");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [errorOpen, setErrorOpen] = useState(false);

	useEffect(() => {
		if (user) {
			setName(user.user_metadata?.full_name ?? "");
			setEmail(user.email ?? "");
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !message.trim()) return;

		setSubmitting(true);
		try {
			const res = await fetch("/api/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, type, message }),
			});

			if (!res.ok) {
				setErrorOpen(true);
				return;
			}

			setSubmitted(true);
		} catch {
			setErrorOpen(true);
		} finally {
			setSubmitting(false);
		}
	};

	const handleSendAnother = () => {
		setSubmitted(false);
		setName(user?.user_metadata?.full_name ?? "");
		setEmail(user?.email ?? "");
		setType("bug");
		setMessage("");
	};

	return (
		<div className="max-w-4xl mx-auto py-4 px-4">
			<div className="pb-4 sm:pb-5 border-b border-border">
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
					{t("listTitle")}
				</h1>
			</div>
			<div className="flex items-center gap-1.5 mt-4 mb-6 text-sm text-muted-foreground">
				<Info className="h-4 w-4 shrink-0" />
				<span>{t("subtitle")}</span>
			</div>

			<form onSubmit={handleSubmit} className="mt-6 space-y-5">
				<div className="space-y-2">
					<label
						htmlFor="feedback-name"
						className="text-sm font-medium text-foreground"
					>
						{t("nameLabel")}
					</label>
					<Input
						id="feedback-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder={t("namePlaceholder")}
						disabled={submitting}
						required
					/>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="feedback-email"
						className="text-sm font-medium text-foreground"
					>
						{t("emailLabel")}
					</label>
					<Input
						id="feedback-email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder={t("emailPlaceholder")}
						disabled={submitting}
						required
					/>
				</div>

				<div className="space-y-2">
					<span className="text-sm font-medium text-foreground">
						{t("typeLabel")}
					</span>
					<div className="flex gap-4">
						{FEEDBACK_TYPES.map((feedbackType) => (
							<label
								key={feedbackType}
								className="flex items-center gap-2 text-sm cursor-pointer"
							>
								<input
									type="radio"
									name="feedback-type"
									value={feedbackType}
									checked={type === feedbackType}
									onChange={() => setType(feedbackType)}
									disabled={submitting}
									className="h-4 w-4 accent-primary"
								/>
								{t(
									`type${feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1)}`,
								)}
							</label>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<label
						htmlFor="feedback-message"
						className="text-sm font-medium text-foreground"
					>
						{t("messageLabel")}
					</label>
					<Textarea
						id="feedback-message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder={t("messagePlaceholder")}
						disabled={submitting}
						required
						rows={5}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={submitting}>
					{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{submitting ? t("submitting") : t("submit")}
				</Button>
			</form>

			<Dialog open={submitted} onOpenChange={setSubmitted}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-center">
							{t("thankYouTitle")}
						</DialogTitle>
						<DialogDescription className="text-center">
							{t("thankYouMessage")}
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-center pt-2">
						<Button onClick={handleSendAnother} className="w-full">
							{t("sendAnother")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<ErrorDialog
				open={errorOpen}
				onOpenChange={setErrorOpen}
				title={t("errorTitle")}
				description={t("errorDescription")}
			/>
		</div>
	);
}
