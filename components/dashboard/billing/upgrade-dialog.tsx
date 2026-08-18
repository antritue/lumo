"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useBillingStore } from "./store";
import type { BillingTier } from "./types";

interface UpgradeDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const TIER_KEYS: {
	tier: BillingTier;
	key: string;
	badge?: boolean;
	tone?: "primary" | "accent";
}[] = [
	{ tier: "monthly", key: "monthly" },
	{ tier: "yearly", key: "yearly", badge: true, tone: "primary" },
	{ tier: "lifetime", key: "lifetime", badge: true, tone: "accent" },
];

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
	const t = useTranslations("app.billing");
	const pt = useTranslations("pricing");
	const startCheckout = useBillingStore((s) => s.startCheckout);
	const isCheckoutLoading = useBillingStore((s) => s.isCheckoutLoading);

	const [checkoutTier, setCheckoutTier] = useState<BillingTier | null>(null);
	const [errorOpen, setErrorOpen] = useState(false);

	useEffect(() => {
		if (open) {
			setCheckoutTier(null);
			setErrorOpen(false);
		}
	}, [open]);

	const handleCheckout = async (tier: BillingTier) => {
		setCheckoutTier(tier);
		try {
			const url = await startCheckout(tier);
			if (url) {
				window.location.assign(url);
			} else {
				setCheckoutTier(null);
			}
		} catch {
			setCheckoutTier(null);
			setErrorOpen(true);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("upgradeTitle")}</DialogTitle>
					<DialogDescription className="sr-only">
						{t("upgradeTitle")}
					</DialogDescription>
				</DialogHeader>

				<p className="text-sm text-muted-foreground leading-relaxed">
					{t("upgradeDescription")}
				</p>

				<div className="space-y-3">
					{TIER_KEYS.map(({ tier, key, badge, tone }) => {
						const isLoading = checkoutTier === tier;
						return (
							<button
								key={tier}
								type="button"
								disabled={isCheckoutLoading || checkoutTier !== null}
								onClick={() => handleCheckout(tier)}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 hover:-translate-y-0.5",
									tone === "primary"
										? "border-primary/30 bg-primary/5"
										: tone === "accent"
											? "border-accent/40 bg-accent/10"
											: "border-border bg-card hover:border-primary/30 hover:shadow-soft-lg",
								)}
							>
								<span className="flex min-w-0 flex-col gap-0.5">
									<span className="flex flex-wrap items-center gap-2">
										<span className="text-sm font-semibold text-foreground">
											{pt(`tiers.${key}.name`)}
										</span>
										{badge && (
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
													tone === "primary"
														? "bg-primary text-primary-foreground"
														: "bg-accent text-accent-foreground",
												)}
											>
												{pt(`tiers.${key}.badge`)}
											</span>
										)}
									</span>
									<span className="text-sm text-muted-foreground">
										{pt(`tiers.${key}.description`)}
									</span>
								</span>

								{isLoading ? (
									<Loader2
										className="h-5 w-5 shrink-0 animate-spin text-primary"
										data-testid="checkout-loader"
									/>
								) : (
									<span className="flex shrink-0 items-baseline gap-1">
										<span className="text-xl font-bold text-foreground">
											{pt(`tiers.${key}.price`)}
										</span>
										<span className="text-sm text-muted-foreground">
											{pt(`tiers.${key}.period`)}
										</span>
									</span>
								)}
							</button>
						);
					})}
				</div>

				<Button
					type="button"
					variant="ghost"
					size="lg"
					className="mx-auto mt-2 w-1/2 border border-border"
					disabled={isCheckoutLoading || checkoutTier !== null}
					onClick={() => onOpenChange(false)}
				>
					{t("cancel")}
				</Button>

				<ErrorDialog
					open={errorOpen}
					onOpenChange={setErrorOpen}
					title={t("checkoutErrorTitle")}
					description={t("checkoutErrorDescription")}
				/>
			</DialogContent>
		</Dialog>
	);
}
