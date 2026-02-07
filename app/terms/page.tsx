import { ArrowLeft, Sun } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Lumo - Terms of Service",
	description:
		"Lumo's terms of service outline the rules and guidelines for using our rent tracking service.",
};

export default function TermsPage() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
			<Button
				variant="ghost"
				asChild
				className="mb-8 -ml-3 text-muted-foreground"
			>
				<Link href="/">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to home
				</Link>
			</Button>

			<div className="mb-12 rounded-lg bg-secondary/50 px-4 py-3 text-sm text-muted-foreground border border-border/50 flex items-center gap-3">
				<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-background border border-border/50">
					<Sun className="h-3 w-3 text-primary" />
				</div>
				<p>This page is currently available in English only.</p>
			</div>

			<article className="prose prose-neutral max-w-none">
				<h1 className="text-3xl font-semibold text-foreground mb-2">
					Terms of Service
				</h1>
				<p className="text-muted-foreground text-sm mb-10">
					Last updated: February 2026
				</p>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Use of the service
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						Lumo is operated by an independent developer. The service is
						provided "as is" without warranties. We do our best to keep the
						service running smoothly, but we can't guarantee it will always be
						available or error-free. By using Lumo, you agree to use it
						responsibly and not for any unlawful purpose.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">Accounts</h2>
					<p className="text-foreground/80 leading-relaxed">
						You sign in to Lumo using your Google account. You're responsible
						for keeping your Google credentials secure. One person should use
						one account. Please don't share access with others
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Your data
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						Your data is stored with Supabase. You own your data. We won't sell
						it or share it with third parties for marketing. For details on how
						we handle your information, see our{" "}
						<Link href="/privacy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Availability and changes
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						We may update Lumo or these terms from time to time. We'll do our
						best to notify you of significant changes. If you continue using
						Lumo after changes, you're agreeing to the updated terms.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Limitation of liability
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						Lumo is a simple tool for tracking rent payments. We're not liable
						for any financial decisions you make based on information in the
						app, or for any loss of data. Please keep your own backups of
						important information.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Contact us
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						Questions about these terms? Email us at{" "}
						<a
							href="mailto:lumo.homes.contact@gmail.com"
							className="text-primary hover:underline"
						>
							lumo.homes.contact@gmail.com
						</a>
						.
					</p>
				</section>
			</article>
		</main>
	);
}
