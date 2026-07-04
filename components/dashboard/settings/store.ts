import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SettingsState {
	isDeleting: boolean;
	deleteError: string | null;
	deleteAccount: () => Promise<void>;
	clearDeleteError: () => void;
	clearStore: () => void;
}

const initialState = {
	isDeleting: false,
	deleteError: null,
};

export const useSettingsStore = create<SettingsState>()(
	devtools(
		(set) => ({
			...initialState,

			deleteAccount: async () => {
				set({ isDeleting: true, deleteError: null });

				try {
					const res = await fetch("/api/settings/delete-account", {
						method: "DELETE",
					});

					if (!res.ok) {
						const body = await res.json().catch(() => ({}));
						throw new Error(body.error ?? "Failed to delete account");
					}

					set({ isDeleting: false });
				} catch (err) {
					const message =
						err instanceof Error ? err.message : "Failed to delete account";
					set({ isDeleting: false, deleteError: message });
					throw err;
				}
			},

			clearDeleteError: () => set({ deleteError: null }),

			clearStore: () => set(initialState),
		}),
		{ name: "settings-store" },
	),
);
