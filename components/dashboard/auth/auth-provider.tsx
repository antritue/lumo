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
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setUser(session.user);
				setLoading(false);
			} else {
				clearAllDomainStores();
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [setUser, setLoading]);

	return <>{children}</>;
}
