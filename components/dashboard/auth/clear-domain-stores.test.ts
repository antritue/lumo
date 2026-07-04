import { describe, expect, it } from "vitest";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { clearAllDomainStores } from "./clear-domain-stores";
import { useAuthStore } from "./store";

describe("clearAllDomainStores", () => {
	it("clears every domain store", () => {
		usePropertiesStore.setState({
			properties: [{ id: "1", userId: "123", name: "P1" }],
			hasPropertiesFetched: true,
		});
		useRoomsStore.setState({
			rooms: [
				{
					id: "1",
					propertyId: "1",
					name: "R1",
					monthlyRent: 1000,
					notes: null,
				},
			],
		});
		useRentPaymentsStore.setState({
			rentPayments: [
				{
					id: "1",
					roomId: "1",
					period: "2025-03",
					rentAmount: 1000,
					status: "pending",
				},
			],
		});

		clearAllDomainStores();

		expect(useAuthStore.getState().user).toBeNull();
		expect(useAuthStore.getState().isAuthBannerDismissed).toBe(false);
		expect(usePropertiesStore.getState().properties).toEqual([]);
		expect(usePropertiesStore.getState().hasPropertiesFetched).toBe(false);
		expect(useRoomsStore.getState().rooms).toEqual([]);
		expect(useRentPaymentsStore.getState().rentPayments).toEqual([]);
	});
});
