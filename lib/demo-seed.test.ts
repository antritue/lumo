import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import {
	buildDemoSeed,
	buildDemoSeedEn,
	buildDemoSeedVi,
	getCurrentPeriod,
	isDemoSeeded,
	seedDemoStoresIfEmpty,
} from "./demo-seed";

const PERIOD = "2026-09";

function resetStores() {
	useAuthStore.setState({ user: null, loading: false });
	usePropertiesStore.getState().clearStore();
	usePropertyServicesStore.getState().clearStore();
	useRoomsStore.getState().clearStore();
	useRoomServicesStore.getState().clearStore();
	useRentPaymentsStore.getState().clearStore();
}

beforeEach(() => {
	resetStores();
	vi.restoreAllMocks();
});

describe("getCurrentPeriod", () => {
	it("returns current YYYY-MM", () => {
		const now = new Date();
		const expected = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
		expect(getCurrentPeriod()).toBe(expected);
	});
});

describe("buildDemoSeedEn", () => {
	it("builds English seed with USD-scale amounts", () => {
		const seed = buildDemoSeedEn(PERIOD);

		expect(seed.period).toBe(PERIOD);
		expect(seed.properties).toHaveLength(2);
		expect(seed.properties[0].name).toContain("Sunshine");
		expect(seed.rooms).toHaveLength(5);
		expect(seed.rooms[0].name).toBe("Room 101");

		// USD-scale rents
		for (const room of seed.rooms) {
			expect(room.monthlyRent).toBeGreaterThanOrEqual(100);
			expect(room.monthlyRent).toBeLessThanOrEqual(1000);
		}

		const elec = seed.propertyServicesByPropertyId["demo-prop-a"].find(
			(s) => s.id === "demo-svc-elec-a",
		);
		expect(elec?.serviceName).toBe("Electricity");
		expect(elec?.unitPrice).toBe(0.15);
	});

	it("has 2 paid and 2 pending payments with one room unrecorded", () => {
		const seed = buildDemoSeedEn(PERIOD);

		expect(seed.rentPayments).toHaveLength(4);
		expect(seed.rentPayments.filter((p) => p.status === "paid")).toHaveLength(
			2,
		);
		expect(
			seed.rentPayments.filter((p) => p.status === "pending"),
		).toHaveLength(2);

		const paidRoomIds = new Set(seed.rentPayments.map((p) => p.roomId));
		expect(paidRoomIds.has("demo-room-103")).toBe(false);

		for (const payment of seed.rentPayments) {
			expect(payment.period).toBe(PERIOD);
		}
	});

	it("links charges to valid payments, rooms, and services", () => {
		const seed = buildDemoSeedEn(PERIOD);

		const paymentIds = new Set(seed.rentPayments.map((p) => p.id));
		const roomIds = new Set(seed.rooms.map((r) => r.id));
		const serviceIds = new Set(
			Object.values(seed.propertyServicesByPropertyId)
				.flat()
				.map((s) => s.id),
		);

		for (const payment of seed.rentPayments) {
			expect(roomIds.has(payment.roomId)).toBe(true);
		}

		for (const [paymentId, charges] of Object.entries(
			seed.serviceChargesByPaymentId,
		)) {
			expect(paymentIds.has(paymentId)).toBe(true);
			expect(charges.length).toBeGreaterThan(0);
			for (const charge of charges) {
				expect(serviceIds.has(charge.serviceId)).toBe(true);
				if (charge.pricingType === "variable") {
					expect(charge.total).toBeCloseTo(
						(charge.usage ?? 0) * (charge.unitPrice ?? 0),
						2,
					);
				} else {
					expect(charge.total).toBe(charge.flatAmount);
				}
			}
		}
	});

	it("disables parking for room 102 as a demo override", () => {
		const seed = buildDemoSeedEn(PERIOD);

		const room102 = seed.roomServicesByRoomId["demo-room-102"];
		const parking = room102.find(
			(s) => s.propertyServiceId === "demo-svc-park-a",
		);
		expect(parking?.isEnabled).toBe(false);
		expect(parking?.isOverridden).toBe(true);

		expect(seed.roomPropertyMap["demo-room-102"]).toBe("demo-prop-a");
	});

	it.each(["en", "vi"] as const)(
		"covers every enabled room service with a charge (%s)",
		(locale) => {
			const seed = buildDemoSeed(PERIOD, locale);
			const paymentById = new Map(seed.rentPayments.map((p) => [p.id, p]));

			for (const [paymentId, charges] of Object.entries(
				seed.serviceChargesByPaymentId,
			)) {
				const payment = paymentById.get(paymentId);
				expect(payment).toBeDefined();
				const enabledIds = (
					seed.roomServicesByRoomId[payment?.roomId ?? ""] ?? []
				)
					.filter((s) => s.isEnabled)
					.map((s) => s.propertyServiceId)
					.sort();
				expect(charges.map((c) => c.serviceId).sort()).toEqual(enabledIds);
			}
		},
	);
});

describe("buildDemoSeedVi", () => {
	it("builds Vietnamese seed with VND-scale amounts", () => {
		const seed = buildDemoSeedVi(PERIOD);

		expect(seed.period).toBe(PERIOD);
		expect(seed.properties[0].name).toContain("Nhà trọ");
		expect(seed.rooms[0].name).toBe("P.101");

		for (const room of seed.rooms) {
			expect(room.monthlyRent).toBeGreaterThanOrEqual(1000000);
		}

		const elec = seed.propertyServicesByPropertyId["demo-prop-a"].find(
			(s) => s.id === "demo-svc-elec-a",
		);
		expect(elec?.serviceName).toBe("Điện");
		expect(elec?.unitPrice).toBe(3500);
	});

	it("mirrors EN topology with the same IDs and payment mix", () => {
		const en = buildDemoSeedEn(PERIOD);
		const vi = buildDemoSeedVi(PERIOD);

		expect(vi.properties.map((p) => p.id)).toEqual(
			en.properties.map((p) => p.id),
		);
		expect(vi.rooms.map((r) => r.id)).toEqual(en.rooms.map((r) => r.id));
		expect(vi.rentPayments.map((p) => p.id)).toEqual(
			en.rentPayments.map((p) => p.id),
		);
		expect(vi.rentPayments.map((p) => p.status)).toEqual(
			en.rentPayments.map((p) => p.status),
		);
	});

	it.each([
		["en", ["Electricity", "Water", "WiFi", "Cleaning", "Parking"]],
		["vi", ["Điện", "Nước", "WiFi", "Vệ sinh", "Giữ xe"]],
	] as const)(
		"uses only Quick-Add preset names so no preset is suggested twice (%s)",
		(locale, presetNames) => {
			// Vocabulary must stay in sync with PRESETS in
			// components/dashboard/properties/property-detail-services.tsx,
			// which hides a Quick-Add preset on exact (case-insensitive) name match.
			const seed = buildDemoSeed(PERIOD, locale);
			const allowed = new Set(presetNames.map((n) => n.toLowerCase()));

			for (const services of Object.values(seed.propertyServicesByPropertyId)) {
				for (const service of services) {
					expect(
						allowed.has(service.serviceName.toLowerCase()),
						`"${service.serviceName}" is not a Quick-Add preset name`,
					).toBe(true);
				}
			}
		},
	);
});

describe("buildDemoSeed dispatcher", () => {
	it("picks EN by default and VI for vi locale", () => {
		expect(buildDemoSeed(PERIOD).rooms[0].name).toBe("Room 101");
		expect(buildDemoSeed(PERIOD, "en").rooms[0].name).toBe("Room 101");
		expect(buildDemoSeed(PERIOD, "vi").rooms[0].name).toBe("P.101");
	});
});

describe("seedDemoStoresIfEmpty", () => {
	it("seeds all stores when unauthenticated and empty", () => {
		seedDemoStoresIfEmpty("en");

		expect(usePropertiesStore.getState().properties).toHaveLength(2);
		expect(useRoomsStore.getState().rooms).toHaveLength(5);
		expect(useRentPaymentsStore.getState().rentPayments).toHaveLength(4);
		expect(
			Object.keys(
				usePropertyServicesStore.getState().propertyServicesByPropertyId,
			),
		).toHaveLength(2);
		expect(
			Object.keys(useRoomServicesStore.getState().roomServicesByRoomId),
		).toHaveLength(5);
		expect(isDemoSeeded()).toBe(true);
	});

	it("seeds Vietnamese content for vi locale", () => {
		seedDemoStoresIfEmpty("vi");

		expect(usePropertiesStore.getState().properties[0].name).toContain(
			"Nhà trọ",
		);
	});

	it("is idempotent on re-seed", () => {
		seedDemoStoresIfEmpty("en");
		seedDemoStoresIfEmpty("en");

		expect(usePropertiesStore.getState().properties).toHaveLength(2);
		expect(useRoomsStore.getState().rooms).toHaveLength(5);
	});

	it("does not seed when authenticated", () => {
		useAuthStore.setState({ user: { id: "user-1" } as User });

		seedDemoStoresIfEmpty("en");

		expect(usePropertiesStore.getState().properties).toHaveLength(0);
		expect(useRoomsStore.getState().rooms).toHaveLength(0);
		expect(isDemoSeeded()).toBe(false);
	});

	it("does not overwrite existing data or switch locale mid-session", () => {
		seedDemoStoresIfEmpty("en");
		seedDemoStoresIfEmpty("vi");

		// First-seeded EN data is kept
		expect(usePropertiesStore.getState().properties[0].name).toContain(
			"Sunshine",
		);
	});
});
