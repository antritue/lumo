import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
	user: User | null;
	loading: boolean;
	setUser: (user: User | null) => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	devtools(
		(set) => ({
			user: null,
			loading: true,
			setUser: (user) => set({ user }),
			setLoading: (loading) => set({ loading }),
		}),
		{ name: "auth" },
	),
);
