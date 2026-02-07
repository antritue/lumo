import { ArrowLeft, Sun } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Lumo - Privacy Policy",
	description:
		"Lumo's privacy policy explains what information we collect and how we use it.",
};

export default function PrivacyPage() {
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
					Privacy Policy
				</h1>
				<p className="text-muted-foreground text-sm mb-10">
					Last updated: February 2026
				</p>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						What we collect
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						When you sign in with Google, we receive your email address to
						identify your account. We do not access your emails, contacts, or
						any other Google account data.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						How we use your information
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						Your Google profile information is used solely for authentication —
						to let you sign in and recognize your account. We don't sell, share,
						or use your data for advertising.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Data storage
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						Your account information and the data you enter (such as property
						and room details) are stored securely with Supabase, our
						authentication and database provider. We only store the information
						you provide to help you track your rent payments.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Third-party services
					</h2>
					<p className="text-foreground/80 leading-relaxed mb-3">
						We use the following services to run Lumo:
					</p>
					<ul className="list-disc list-inside text-foreground/80 space-y-1">
						<li>
							<strong>Google OAuth</strong> — for sign-in
						</li>
						<li>
							<strong>Supabase</strong> — for authentication and data storage
						</li>
					</ul>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Your choices
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						You can revoke Lumo's access to your Google account at any time
						through your{" "}
						<a
							href="https://myaccount.google.com/permissions"
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							Google Account settings
						</a>
						. If you'd like your data deleted, contact us and we'll remove it.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-xl font-medium text-foreground mb-3">
						Contact us
					</h2>
					<p className="text-foreground/80 leading-relaxed">
						Questions about this policy? Email us at{" "}
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
