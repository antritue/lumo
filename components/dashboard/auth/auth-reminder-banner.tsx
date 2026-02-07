"use client";

import { Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "./store";

export function AuthReminderBanner() {
	const user = useAuthStore((state) => state.user);
	const loading = useAuthStore((state) => state.loading);
	const isAuthBannerDismissed = useAuthStore(
		(state) => state.isAuthBannerDismissed,
	);
	const dismissAuthBanner = useAuthStore((state) => state.dismissAuthBanner);
	const t = useTranslations("app.authBanner");

	// Show when unauthenticated, not dismissed, and finished loading
	const showBanner = !loading && !user && !isAuthBannerDismissed;

	if (!showBanner) return null;

	return (
		<div
			className="group relative mb-8 flex w-full flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
			role="alert"
		>
			<div className="flex items-center gap-4 flex-1">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 sm:h-12 sm:w-12">
					<Info className="h-5 w-5 text-amber-900 sm:h-6 sm:w-6" />
				</div>
				<div className="flex-1">
					<h3 className="text-base font-semibold text-amber-900 leading-tight">
						{t("title")}
					</h3>
					<p className="text-sm text-amber-800/80 leading-relaxed">
						{t("message")}
					</p>
				</div>
			</div>
			<button
				type="button"
				onClick={dismissAuthBanner}
				className="absolute right-3 top-3 rounded-xl p-2 text-amber-900/50 transition-all hover:bg-amber-100 hover:text-amber-900 sm:static"
				aria-label={t("close")}
			>
				<X className="h-5 w-5" />
			</button>
		</div>
	);
}
