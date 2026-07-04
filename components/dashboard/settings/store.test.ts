import { act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettingsStore } from "./store";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("SettingsStore", () => {
	beforeEach(() => {
		act(() => {
			useSettingsStore.getState().clearStore();
		});
		mockFetch.mockReset();
	});

	describe("deleteAccount", () => {
		it("sets isDeleting while deleting", async () => {
			let resolveFetch!: (value: unknown) => void;
			mockFetch.mockReturnValueOnce(
				new Promise((resolve) => {
					resolveFetch = resolve;
				}),
			);

			const promise = useSettingsStore.getState().deleteAccount();

			expect(useSettingsStore.getState().isDeleting).toBe(true);

			resolveFetch({ ok: true, status: 204, json: async () => {} });
			await promise;
		});

		it("clears isDeleting on success", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				status: 204,
				json: async () => {},
			});

			await useSettingsStore.getState().deleteAccount();

			expect(useSettingsStore.getState().isDeleting).toBe(false);
			expect(useSettingsStore.getState().deleteError).toBeNull();
		});

		it("sets deleteError on failure", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: async () => ({ error: "Server error" }),
			});

			await expect(useSettingsStore.getState().deleteAccount()).rejects.toThrow(
				"Server error",
			);

			expect(useSettingsStore.getState().deleteError).toBe("Server error");
		});
	});
});
