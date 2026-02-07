import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
	user: User | null;
	loading: boolean;
	isAuthBannerDismissed: boolean;
	setUser: (user: User | null) => void;
	setLoading: (loading: boolean) => void;
	dismissAuthBanner: () => void;
}

export const useAuthStore = create<AuthState>()(
	devtools(
		(set) => ({
			user: null,
			loading: true,
			isAuthBannerDismissed: false,
			setUser: (user) => set({ user }),
			setLoading: (loading) => set({ loading }),
			dismissAuthBanner: () => {
				set({ isAuthBannerDismissed: true });
			},
		}),
		{ name: "auth" },
	),
);
