"use client";

import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/dashboard/auth";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useBillingStore } from "@/components/dashboard/billing/store";
import { UpgradeDialog } from "@/components/dashboard/billing/upgrade-dialog";
import { ErrorDialog } from "@/components/shared/error-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SettingsBillingCard() {
	const t = useTranslations("app");
	const authT = useTranslations("auth");
	const status = useBillingStore((s) => s.status);
	const isStatusFetchFailed = useBillingStore((s) => s.isStatusFetchFailed);
	const isStatusLoading = useBillingStore((s) => s.isStatusLoading);
	const fetchStatus = useBillingStore((s) => s.fetchStatus);
	const startPortal = useBillingStore((s) => s.startPortal);
	const startCheckout = useBillingStore((s) => s.startCheckout);
	const isCheckoutLoading = useBillingStore((s) => s.isCheckoutLoading);
	const user = useAuthStore((s) => s.user);
	const authLoading = useAuthStore((s) => s.loading);
	const { signInWithGoogle } = useAuth();

	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [portalErrorOpen, setPortalErrorOpen] = useState(false);
	const [checkoutErrorOpen, setCheckoutErrorOpen] = useState(false);
	const [signInErrorOpen, setSignInErrorOpen] = useState(false);

	useEffect(() => {
		if (user) {
			fetchStatus();
		}
	}, [user, fetchStatus]);

	const isPaid = status?.isPaid ?? false;

	const roomCount = status?.roomCount ?? 0;
	const roomLimit = status?.roomLimit ?? 5;

	const planLabel = !isPaid
		? t("settingsBilling.planFree")
		: status?.tier === "monthly"
			? t("settingsBilling.planMonthly")
			: status?.tier === "yearly"
				? t("settingsBilling.planYearly")
				: t("settingsBilling.planLifetime");

	const handleLifetimeCheckout = async () => {
		try {
			const url = await startCheckout("lifetime");
			if (url) {
				window.location.assign(url);
			}
		} catch {
			setCheckoutErrorOpen(true);
		}
	};

	const handlePortal = async () => {
		try {
			const url = await startPortal();
			if (url) {
				window.location.assign(url);
			}
		} catch {
			setPortalErrorOpen(true);
		}
	};

	const handleSignIn = async () => {
		try {
			await signInWithGoogle();
		} catch {
			setSignInErrorOpen(true);
		}
	};

	return (
		<section>
			<Card>
				<CardHeader>
					<CardTitle>{t("settingsBilling.title")}</CardTitle>
					<CardDescription>
						{t("settingsBilling.planDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{authLoading || isStatusLoading ? (
						<div className="space-y-3">
							<Skeleton className="h-5 w-28" />
							<Skeleton className="h-4 w-44" />
						</div>
					) : isStatusFetchFailed ? (
						<ErrorState onRetry={() => fetchStatus()} />
					) : !user ? (
						<div className="space-y-5">
							<div className="rounded-xl border border-border bg-secondary/50 p-4">
								<div className="flex items-center justify-between gap-4">
									<div className="space-y-1">
										<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
											{t("settingsBilling.currentPlan")}
										</p>
										<p className="text-xl font-semibold text-foreground">
											{t("settingsBilling.planFree")}
										</p>
									</div>
									<div
										className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
										aria-hidden="true"
									>
										<Lock className="h-4 w-4 text-muted-foreground" />
									</div>
								</div>
								<p className="mt-3 text-sm text-muted-foreground leading-relaxed">
									{t("settingsBilling.signedOutPrompt")}
								</p>
							</div>

							<Button
								type="button"
								className="w-fit"
								onClick={handleSignIn}
								disabled={authLoading}
							>
								{t("settingsBilling.signIn")}
							</Button>
						</div>
					) : (
						<div className="space-y-5">
							<div className="rounded-xl border border-border bg-secondary/50 p-4">
								<div className="space-y-1">
									<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
										{t("settingsBilling.currentPlan")}
									</p>
									<p className="text-xl font-semibold text-foreground">
										{planLabel}
									</p>
								</div>

								{!isPaid && roomLimit > 0 && (
									<div
										className="mt-4 mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
										role="progressbar"
										aria-valuemin={0}
										aria-valuemax={roomLimit}
										aria-valuenow={roomCount}
										aria-label={t("settingsBilling.roomUsage", {
											count: roomCount,
											limit: roomLimit,
										})}
									>
										<div
											className={cn(
												"h-full rounded-full transition-[width] duration-300",
												roomCount > roomLimit ? "bg-destructive" : "bg-primary",
											)}
											style={{
												width: `${Math.min(
													100,
													Math.round((roomCount / roomLimit) * 100),
												)}%`,
											}}
										/>
									</div>
								)}

								<p
									className={cn(
										"text-sm text-muted-foreground",
										isPaid && "mt-3",
									)}
								>
									{isPaid
										? t("settingsBilling.unlimitedRooms")
										: t("settingsBilling.roomUsage", {
												count: roomCount,
												limit: roomLimit,
											})}
								</p>
							</div>

							<div className="flex flex-col gap-3">
								<div className="flex flex-wrap items-center gap-2">
									{isPaid ? (
										<>
											{status?.tier !== "lifetime" && (
												<Button
													type="button"
													variant="outline"
													className="w-fit"
													disabled={isCheckoutLoading}
													onClick={handlePortal}
												>
													{t("settingsBilling.manageSubscription")}
												</Button>
											)}
											{status?.tier !== "lifetime" && (
												<Button
													type="button"
													variant="outline"
													className="w-fit"
													disabled={isCheckoutLoading}
													onClick={handleLifetimeCheckout}
												>
													{t("settingsBilling.buyLifetime")}
												</Button>
											)}
										</>
									) : (
										<Button
											type="button"
											className="w-fit"
											onClick={() => setUpgradeOpen(true)}
										>
											{t("settingsBilling.upgrade")}
										</Button>
									)}
								</div>
								{isPaid && status?.tier !== "lifetime" && (
									<p className="text-sm text-muted-foreground">
										{t("settingsBilling.buyLifetimeDescription")}
									</p>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />

			<ErrorDialog
				open={signInErrorOpen}
				onOpenChange={setSignInErrorOpen}
				title={authT("error.title")}
				description={authT("error.description")}
			/>

			<ErrorDialog
				open={portalErrorOpen}
				onOpenChange={setPortalErrorOpen}
				title={t("settingsBilling.portalErrorTitle")}
				description={t("settingsBilling.portalErrorDescription")}
			/>

			<ErrorDialog
				open={checkoutErrorOpen}
				onOpenChange={setCheckoutErrorOpen}
				title={t("billing.checkoutErrorTitle")}
				description={t("billing.checkoutErrorDescription")}
			/>
		</section>
	);
}
