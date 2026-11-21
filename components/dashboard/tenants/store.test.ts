import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { RoomOccupiedError, useTenantsStore } from "./store";
import type { Tenant } from "./types";

const mockFetch = vi.fn();
global.fetch = mockFetch;

Object.defineProperty(global, "crypto", {
	value: { randomUUID: () => "test-uuid" },
});

const mockTenant = (overrides: Partial<Tenant> = {}): Tenant => ({
	id: "tenant-1",
	userId: "",
	roomId: null,
	fullName: "Anh Nguyen",
	phone: "0901 234 567",
	email: "anh@example.com",
	notes: null,
	...overrides,
});

const authenticate = () => {
	useAuthStore.setState({ user: { id: "user-123" } as User, loading: false });
};

const resetStore = () => {
	useTenantsStore.getState().clearStore();
	useAuthStore.setState({ user: null, loading: false });
};

beforeEach(() => {
	resetStore();
	mockFetch.mockReset();
});

describe("TenantsStore", () => {
	describe("createTenant", () => {
		it("creates tenant locally when unauthenticated", async () => {
			await useTenantsStore.getState().createTenant({
				fullName: "Anh Nguyen",
				roomId: null,
				phone: null,
				email: null,
				notes: null,
			});

			const [tenant] = useTenantsStore.getState().tenants;
			expect(tenant.id).toBe("test-uuid");
			expect(tenant.userId).toBe("");
			expect(tenant.fullName).toBe("Anh Nguyen");
			expect(tenant.roomId).toBeNull();
		});

		it("rejects a room that already has an active tenant", async () => {
			useTenantsStore.setState({ tenants: [mockTenant({ roomId: "room-1" })] });

			await expect(
				useTenantsStore.getState().createTenant({
					fullName: "Binh Le",
					roomId: "room-1",
					phone: null,
					email: null,
					notes: null,
				}),
			).rejects.toBeInstanceOf(RoomOccupiedError);

			expect(useTenantsStore.getState().tenants).toHaveLength(1);
		});

		it("maps a 409 to RoomOccupiedError when authenticated", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({ ok: false, status: 409 });

			await expect(
				useTenantsStore.getState().createTenant({
					fullName: "Anh Nguyen",
					roomId: "room-1",
					phone: null,
					email: null,
					notes: null,
				}),
			).rejects.toBeInstanceOf(RoomOccupiedError);

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/tenants",
				expect.objectContaining({ method: "POST" }),
			);
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTenant({ id: "server-id" }),
			});

			await useTenantsStore.getState().createTenant({
				fullName: "Anh Nguyen",
				roomId: null,
				phone: null,
				email: null,
				notes: null,
			});

			expect(useTenantsStore.getState().tenants[0].id).toBe("server-id");
		});
	});

	describe("updateTenant", () => {
		it("updates tenant locally when unauthenticated", async () => {
			useTenantsStore.setState({ tenants: [mockTenant()] });

			await useTenantsStore.getState().updateTenant("tenant-1", {
				fullName: "Anh Nguyen",
				roomId: "room-2",
				phone: null,
				email: "anh@example.com",
				notes: "Quiet tenant",
			});

			const [tenant] = useTenantsStore.getState().tenants;
			expect(tenant.roomId).toBe("room-2");
			expect(tenant.phone).toBeNull();
			expect(tenant.notes).toBe("Quiet tenant");
		});

		it("rejects assigning a room held by another tenant", async () => {
			useTenantsStore.setState({
				tenants: [
					mockTenant(),
					mockTenant({ id: "tenant-2", roomId: "room-2" }),
				],
			});

			await expect(
				useTenantsStore.getState().updateTenant("tenant-1", {
					fullName: "Anh Nguyen",
					roomId: "room-2",
					phone: null,
					email: null,
					notes: null,
				}),
			).rejects.toBeInstanceOf(RoomOccupiedError);
		});

		it("keeps a tenant's own room assignable", async () => {
			useTenantsStore.setState({ tenants: [mockTenant({ roomId: "room-1" })] });

			await useTenantsStore.getState().updateTenant("tenant-1", {
				fullName: "Anh Nguyen",
				roomId: "room-1",
				phone: null,
				email: null,
				notes: null,
			});

			expect(useTenantsStore.getState().tenants[0].roomId).toBe("room-1");
		});

		it("calls API and updates state when authenticated", async () => {
			authenticate();
			useTenantsStore.setState({ tenants: [mockTenant()] });
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTenant({ roomId: "room-2" }),
			});

			await useTenantsStore.getState().updateTenant("tenant-1", {
				fullName: "Anh Nguyen",
				roomId: "room-2",
				phone: null,
				email: null,
				notes: null,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/tenants/tenant-1",
				expect.objectContaining({ method: "PATCH" }),
			);
			expect(useTenantsStore.getState().tenants[0].roomId).toBe("room-2");
		});
	});

	describe("deactivateTenant", () => {
		it("clears the room assignment and keeps the contact record", async () => {
			useTenantsStore.setState({ tenants: [mockTenant({ roomId: "room-1" })] });

			await useTenantsStore.getState().deactivateTenant("tenant-1");

			const [tenant] = useTenantsStore.getState().tenants;
			expect(tenant.roomId).toBeNull();
			expect(tenant.fullName).toBe("Anh Nguyen");
			expect(tenant.phone).toBe("0901 234 567");
		});
	});

	describe("deleteTenant", () => {
		it("deletes tenant locally when unauthenticated", async () => {
			useTenantsStore.setState({ tenants: [mockTenant()] });

			await useTenantsStore.getState().deleteTenant("tenant-1");

			expect(useTenantsStore.getState().tenants).toEqual([]);
		});

		it("calls API and removes tenant when authenticated", async () => {
			authenticate();
			useTenantsStore.setState({ tenants: [mockTenant()] });
			mockFetch.mockResolvedValueOnce({ ok: true });

			await useTenantsStore.getState().deleteTenant("tenant-1");

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/tenants/tenant-1",
				expect.objectContaining({ method: "DELETE" }),
			);
			expect(useTenantsStore.getState().tenants).toEqual([]);
		});

		it("handles API error gracefully", async () => {
			authenticate();
			useTenantsStore.setState({ tenants: [mockTenant()] });
			mockFetch.mockResolvedValueOnce({ ok: false });
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(
				useTenantsStore.getState().deleteTenant("tenant-1"),
			).rejects.toThrow("Failed to delete tenant");

			expect(useTenantsStore.getState().tenants).toHaveLength(1);
			consoleSpy.mockRestore();
		});
	});

	describe("unassignByRoomId", () => {
		it("clears every tenant assigned to the room", () => {
			useTenantsStore.setState({
				tenants: [
					mockTenant({ roomId: "room-1" }),
					mockTenant({ id: "tenant-2", roomId: "room-2" }),
				],
			});

			useTenantsStore.getState().unassignByRoomId("room-1");

			const tenants = useTenantsStore.getState().tenants;
			expect(tenants[0].roomId).toBeNull();
			expect(tenants[1].roomId).toBe("room-2");
		});
	});

	describe("fetchTenants", () => {
		it("does not fetch when unauthenticated", async () => {
			await useTenantsStore.getState().fetchTenants();

			expect(mockFetch).not.toHaveBeenCalled();
			expect(useTenantsStore.getState().hasTenantsFetched).toBe(false);
		});

		it("fetches and sets tenants when authenticated", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => [mockTenant()],
			});

			await useTenantsStore.getState().fetchTenants();

			expect(mockFetch).toHaveBeenCalledWith(
				"/api/tenants",
				expect.objectContaining({ method: "GET" }),
			);
			expect(useTenantsStore.getState().tenants).toHaveLength(1);
			expect(useTenantsStore.getState().hasTenantsFetched).toBe(true);
			expect(useTenantsStore.getState().isTenantsLoading).toBe(false);
		});

		it("handles fetch error gracefully", async () => {
			authenticate();
			mockFetch.mockResolvedValueOnce({ ok: false });
			const consoleSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			await expect(useTenantsStore.getState().fetchTenants()).rejects.toThrow(
				"Failed to fetch tenants",
			);

			expect(useTenantsStore.getState().isTenantsFetchFailed).toBe(true);
			expect(useTenantsStore.getState().hasTenantsFetched).toBe(false);
			consoleSpy.mockRestore();
		});
	});

	describe("clearStore", () => {
		it("resets all store data to initial state", () => {
			useTenantsStore.setState({
				tenants: [mockTenant()],
				hasTenantsFetched: true,
				isTenantsLoading: true,
				isTenantsFetchFailed: true,
			});

			useTenantsStore.getState().clearStore();

			expect(useTenantsStore.getState()).toMatchObject({
				tenants: [],
				hasTenantsFetched: false,
				isTenantsLoading: false,
				isTenantsFetchFailed: false,
			});
		});
	});
});
