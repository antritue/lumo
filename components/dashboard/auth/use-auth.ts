"use client";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "./store";

export function useAuth() {
	const user = useAuthStore((state) => state.user);
	const loading = useAuthStore((state) => state.loading);

	const signInWithGoogle = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/api/auth/callback`,
				queryParams: {
					prompt: "select_account",
				},
			},
		});

		if (error) throw error;
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
	};

	return {
		user,
		loading,
		signInWithGoogle,
		signOut,
	};
}
