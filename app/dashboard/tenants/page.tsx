"use client";

import { DevelopmentBanner } from "@/components/shared/development-banner";
import { useFeatureFlag } from "@/components/shared/use-feature-flag";
import { FEATURES } from "@/lib/feature-flags";

export default function TenantsPage() {
	const isTenantEnabled = useFeatureFlag(FEATURES.TENANT);

	return (
		<div className="max-w-4xl mx-auto py-8 px-4">
			<DevelopmentBanner enabled={isTenantEnabled} />
		</div>
	);
}
