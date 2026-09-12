import type { User } from "@supabase/supabase-js";
import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { clearAllDomainStores } from "@/components/dashboard/auth/clear-domain-stores";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { renderWithProviders } from "@/test/render";
import { DemoSeedInitializer } from "./demo-seed-initializer";

function resetAll() {
	useAuthStore.setState({ user: null, loading: true });
	usePropertiesStore.getState().clearStore();
	usePropertyServicesStore.getState().clearStore();
	useRoomsStore.getState().clearStore();
	useRoomServicesStore.getState().clearStore();
	useRentPaymentsStore.getState().clearStore();
}

function propertyCount() {
	return usePropertiesStore.getState().properties.length;
}

beforeEach(() => {
	resetAll();
});

describe("DemoSeedInitializer", () => {
	it("renders nothing", () => {
		const { container } = renderWithProviders(<DemoSeedInitializer />);

		expect(container.textContent).toBe("");
	});

	it("does not seed while auth is resolving", () => {
		useAuthStore.setState({ user: null, loading: true });

		renderWithProviders(<DemoSeedInitializer />);

		expect(propertyCount()).toBe(0);
	});

	it("seeds once auth resolves as guest", () => {
		const { rerender } = renderWithProviders(<DemoSeedInitializer />);
		expect(propertyCount()).toBe(0);

		useAuthStore.setState({ user: null, loading: false });
		rerender(<DemoSeedInitializer />);

		expect(propertyCount()).toBe(2);
		expect(useRoomsStore.getState().rooms).toHaveLength(5);
	});

	it("does not seed for authenticated users", () => {
		useAuthStore.setState({
			user: { id: "user-1" } as unknown as User,
			loading: false,
		});

		renderWithProviders(<DemoSeedInitializer />);

		expect(propertyCount()).toBe(0);
	});

	it("does not reseed on re-render once data exists", () => {
		useAuthStore.setState({ user: null, loading: false });
		const { rerender } = renderWithProviders(<DemoSeedInitializer />);
		expect(propertyCount()).toBe(2);

		usePropertiesStore.setState({
			properties: [
				...usePropertiesStore.getState().properties,
				{ id: "extra", userId: "", name: "Extra" },
			],
		});
		rerender(<DemoSeedInitializer />);

		// Untouched: seeding only fills empty stores, never overwrites.
		expect(usePropertiesStore.getState().properties.map((p) => p.id)).toContain(
			"extra",
		);
		expect(propertyCount()).toBe(3);
	});

	it("seeds again after logout empties the stores", async () => {
		useAuthStore.setState({ user: null, loading: false });
		renderWithProviders(<DemoSeedInitializer />);
		expect(propertyCount()).toBe(2);

		// Real logout flow, one transition at a time so each runs its effect.
		act(() => {
			useAuthStore.setState({
				user: { id: "user-1" } as unknown as User,
				loading: false,
			});
		});
		act(() => {
			clearAllDomainStores();
		});

		await waitFor(() => {
			expect(propertyCount()).toBe(2);
		});
	});
});
