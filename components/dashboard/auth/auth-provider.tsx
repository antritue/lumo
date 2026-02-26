"use client";

import { useEffect } from "react";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "./store";

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const setUser = useAuthStore((state) => state.setUser);
	const setLoading = useAuthStore((state) => state.setLoading);
	const clearStore = useAuthStore((state) => state.clearStore);
	const clearPropertiesStore = usePropertiesStore((state) => state.clearStore);
	const clearRoomsStore = useRoomsStore((state) => state.clearStore);
	const clearRentPaymentsStore = useRentPaymentsStore(
		(state) => state.clearStore,
	);

	useEffect(() => {
		// Get initial session
		const initializeAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);
			setLoading(false);
		};

		initializeAuth();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				setUser(session.user);
				setLoading(false);
			} else {
				// User signed out - clear all store data
				clearStore();
				clearPropertiesStore();
				clearRoomsStore();
				clearRentPaymentsStore();
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, [
		setUser,
		setLoading,
		clearStore,
		clearPropertiesStore,
		clearRoomsStore,
		clearRentPaymentsStore,
	]);

	return <>{children}</>;
}
