"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DeleteAccountDialog } from "@/components/dashboard/settings/delete-account-dialog";
import { useSettingsStore } from "@/components/dashboard/settings/store";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
	const t = useTranslations("app.settings");
	const router = useRouter();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const deleteAccount = useSettingsStore((s) => s.deleteAccount);

	const handleDeleteAccount = async () => {
		await deleteAccount();
		await supabase.auth.signOut();
		router.push("/");
		router.refresh();
	};

	return (
		<div className="max-w-4xl mx-auto py-4 px-4">
			<div className="pb-4 sm:pb-5 border-b border-border">
				<h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
					{t("title")}
				</h1>
			</div>

			<div className="mt-6 space-y-6">
				<section>
					<Card className="border-destructive/20">
						<CardHeader>
							<CardTitle className="text-destructive">
								{t("deleteAccountTitle")}
							</CardTitle>
							<CardDescription>{t("deleteAccountDescription")}</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								variant="destructive"
								onClick={() => setDeleteDialogOpen(true)}
							>
								{t("deleteAccountButton")}
							</Button>

							<DeleteAccountDialog
								open={deleteDialogOpen}
								onOpenChange={setDeleteDialogOpen}
								onConfirm={handleDeleteAccount}
							/>
						</CardContent>
					</Card>
				</section>
			</div>
		</div>
	);
}
