"use client";

import { useSearchParams } from "next/navigation";
import { type Feature, isFeatureEnabled } from "@/lib/feature-flags";

export function useFeatureFlag(feature: Feature): boolean {
	const searchParams = useSearchParams();
	return isFeatureEnabled(feature, searchParams.getAll("feature"));
}
