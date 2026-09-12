"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { clearAllDomainStores } from "./clear-domain-stores";
import { useAuthStore } from "./store";

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const setUser = useAuthStore((state) => state.setUser);
	const setLoading = useAuthStore((state) => state.setLoading);

	useEffect(() => {
		const initializeAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);
			setLoading(false);
		};

		initializeAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			// Sign-out: wipe all domain data, nothing else to do.
			if (event === "SIGNED_OUT") {
				clearAllDomainStores();
				return;
			}

			// Guest → logged-in: drop demo data before setting the real user.
			const isGuestToUser =
				event === "SIGNED_IN" && session?.user && !useAuthStore.getState().user;
			if (isGuestToUser) {
				clearAllDomainStores();
			}

			// Sync auth state (runs for SIGNED_IN, TOKEN_REFRESHED, INITIAL_SESSION).
			setUser(session?.user ?? null);
			setLoading(false);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [setUser, setLoading]);

	return <>{children}</>;
}
