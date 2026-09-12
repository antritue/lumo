import { useAuthStore } from "@/components/dashboard/auth/store";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import type {
	Property,
	PropertyService,
} from "@/components/dashboard/properties/types";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import type {
	PaymentRecord,
	ServiceCharge,
} from "@/components/dashboard/rent-payments/types";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import type {
	EffectiveRoomService,
	Room,
} from "@/components/dashboard/rooms/types";
import type { Locale } from "./constants";

export interface DemoSeed {
	period: string;
	properties: Property[];
	propertyServicesByPropertyId: Record<string, PropertyService[]>;
	rooms: Room[];
	rentPayments: PaymentRecord[];
	serviceChargesByPaymentId: Record<string, ServiceCharge[]>;
	roomServicesByRoomId: Record<string, EffectiveRoomService[]>;
	roomPropertyMap: Record<string, string>;
}

export function getCurrentPeriod(): string {
	const now = new Date();
	return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
}

interface SeedTexts {
	propAName: string;
	propBName: string;
	roomNames: [string, string, string, string, string];
	roomNotes: [string, string, string, string, string];
	electricity: string;
	water: string;
	wifi: string;
	cleaning: string;
	parking: string;
	kwh: string;
	m3: string;
}

interface SeedAmounts {
	rents: [number, number, number, number, number];
	elecUnitA: number;
	waterUnitA: number;
	netFlatA: number;
	cleanFlatA: number;
	parkFlatA: number;
	elecUnitB: number;
	waterUnitB: number;
	netFlatB: number;
	cleanFlatB: number;
	pay101ElecUsage: number;
	pay101WaterUsage: number;
	pay102ElecUsage: number;
	pay102WaterUsage: number;
	pay201ElecUsage: number;
	pay201WaterUsage: number;
	pay202ElecUsage: number;
	pay202WaterUsage: number;
}

const EN_TEXTS: SeedTexts = {
	propAName: "Sunshine Boarding House – 12 Nguyen Hue",
	propBName: "Phu Nhuan Mini Apartments",
	roomNames: ["Room 101", "Room 102", "Room 103", "Room 201", "Room 202"],
	roomNotes: [
		"Corner room, large window",
		"Quiet room near the garden",
		"Newly renovated",
		"Balcony with city view",
		"Top floor, extra storage",
	],
	electricity: "Electricity",
	water: "Water",
	wifi: "WiFi",
	cleaning: "Cleaning",
	parking: "Parking",
	kwh: "kWh",
	m3: "m³",
};

const EN_AMOUNTS: SeedAmounts = {
	rents: [180, 200, 250, 290, 320],
	elecUnitA: 0.15,
	waterUnitA: 1.2,
	netFlatA: 10,
	cleanFlatA: 5,
	parkFlatA: 12,
	elecUnitB: 0.16,
	waterUnitB: 1.3,
	netFlatB: 12,
	cleanFlatB: 6,
	pay101ElecUsage: 120,
	pay101WaterUsage: 10,
	pay102ElecUsage: 95,
	pay102WaterUsage: 8,
	pay201ElecUsage: 140,
	pay201WaterUsage: 12,
	pay202ElecUsage: 100,
	pay202WaterUsage: 9,
};

const VI_TEXTS: SeedTexts = {
	propAName: "Nhà trọ Sunshine – Nguyễn Huệ",
	propBName: "Căn hộ mini Phú Nhuận",
	roomNames: ["P.101", "P.102", "P.103", "P.201", "P.202"],
	roomNotes: [
		"Phòng góc, cửa sổ lớn",
		"Phòng yên tĩnh gần vườn",
		"Mới sửa sang",
		"Ban công view thành phố",
		"Tầng cao, có kho riêng",
	],
	electricity: "Điện",
	water: "Nước",
	wifi: "WiFi",
	cleaning: "Vệ sinh",
	parking: "Giữ xe",
	kwh: "kWh",
	m3: "m³",
};

const VI_AMOUNTS: SeedAmounts = {
	rents: [3200000, 3500000, 4200000, 5000000, 5500000],
	elecUnitA: 3500,
	waterUnitA: 25000,
	netFlatA: 100000,
	cleanFlatA: 50000,
	parkFlatA: 150000,
	elecUnitB: 3800,
	waterUnitB: 27000,
	netFlatB: 120000,
	cleanFlatB: 60000,
	pay101ElecUsage: 85,
	pay101WaterUsage: 12,
	pay102ElecUsage: 72,
	pay102WaterUsage: 10,
	pay201ElecUsage: 110,
	pay201WaterUsage: 14,
	pay202ElecUsage: 95,
	pay202WaterUsage: 11,
};

function round2(n: number): number {
	return Math.round(n * 100) / 100;
}

function buildTopology(period: string, t: SeedTexts, a: SeedAmounts): DemoSeed {
	const properties: Property[] = [
		{ id: "demo-prop-a", userId: "", name: t.propAName },
		{ id: "demo-prop-b", userId: "", name: t.propBName },
	];

	const propertyServicesByPropertyId: Record<string, PropertyService[]> = {
		"demo-prop-a": [
			{
				id: "demo-svc-elec-a",
				propertyId: "demo-prop-a",
				serviceName: t.electricity,
				unitLabel: t.kwh,
				pricingType: "variable",
				flatAmount: null,
				unitPrice: a.elecUnitA,
			},
			{
				id: "demo-svc-water-a",
				propertyId: "demo-prop-a",
				serviceName: t.water,
				unitLabel: t.m3,
				pricingType: "variable",
				flatAmount: null,
				unitPrice: a.waterUnitA,
			},
			{
				id: "demo-svc-net-a",
				propertyId: "demo-prop-a",
				serviceName: t.wifi,
				unitLabel: null,
				pricingType: "flat",
				flatAmount: a.netFlatA,
				unitPrice: null,
			},
			{
				id: "demo-svc-clean-a",
				propertyId: "demo-prop-a",
				serviceName: t.cleaning,
				unitLabel: null,
				pricingType: "flat",
				flatAmount: a.cleanFlatA,
				unitPrice: null,
			},
			{
				id: "demo-svc-park-a",
				propertyId: "demo-prop-a",
				serviceName: t.parking,
				unitLabel: null,
				pricingType: "flat",
				flatAmount: a.parkFlatA,
				unitPrice: null,
			},
		],
		"demo-prop-b": [
			{
				id: "demo-svc-elec-b",
				propertyId: "demo-prop-b",
				serviceName: t.electricity,
				unitLabel: t.kwh,
				pricingType: "variable",
				flatAmount: null,
				unitPrice: a.elecUnitB,
			},
			{
				id: "demo-svc-water-b",
				propertyId: "demo-prop-b",
				serviceName: t.water,
				unitLabel: t.m3,
				pricingType: "variable",
				flatAmount: null,
				unitPrice: a.waterUnitB,
			},
			{
				id: "demo-svc-net-b",
				propertyId: "demo-prop-b",
				serviceName: t.wifi,
				unitLabel: null,
				pricingType: "flat",
				flatAmount: a.netFlatB,
				unitPrice: null,
			},
			{
				id: "demo-svc-clean-b",
				propertyId: "demo-prop-b",
				serviceName: t.cleaning,
				unitLabel: null,
				pricingType: "flat",
				flatAmount: a.cleanFlatB,
				unitPrice: null,
			},
		],
	};

	const rooms: Room[] = [
		{
			id: "demo-room-101",
			propertyId: "demo-prop-a",
			name: t.roomNames[0],
			monthlyRent: a.rents[0],
			notes: t.roomNotes[0],
		},
		{
			id: "demo-room-102",
			propertyId: "demo-prop-a",
			name: t.roomNames[1],
			monthlyRent: a.rents[1],
			notes: t.roomNotes[1],
		},
		{
			id: "demo-room-103",
			propertyId: "demo-prop-a",
			name: t.roomNames[2],
			monthlyRent: a.rents[2],
			notes: t.roomNotes[2],
		},
		{
			id: "demo-room-201",
			propertyId: "demo-prop-b",
			name: t.roomNames[3],
			monthlyRent: a.rents[3],
			notes: t.roomNotes[3],
		},
		{
			id: "demo-room-202",
			propertyId: "demo-prop-b",
			name: t.roomNames[4],
			monthlyRent: a.rents[4],
			notes: t.roomNotes[4],
		},
	];

	const rentPayments: PaymentRecord[] = [
		{
			id: "demo-pay-101",
			roomId: "demo-room-101",
			period,
			rentAmount: a.rents[0],
			status: "paid",
		},
		{
			id: "demo-pay-102",
			roomId: "demo-room-102",
			period,
			rentAmount: a.rents[1],
			status: "pending",
		},
		{
			id: "demo-pay-201",
			roomId: "demo-room-201",
			period,
			rentAmount: a.rents[3],
			status: "paid",
		},
		{
			id: "demo-pay-202",
			roomId: "demo-room-202",
			period,
			rentAmount: a.rents[4],
			status: "pending",
		},
	];

	const variable = (
		serviceId: string,
		serviceName: string,
		unitLabel: string,
		unitPrice: number,
		usage: number,
	): ServiceCharge => ({
		serviceId,
		serviceName,
		pricingType: "variable",
		unitLabel,
		unitPrice,
		flatAmount: null,
		usage,
		total: round2(usage * unitPrice),
	});

	const flat = (
		serviceId: string,
		serviceName: string,
		flatAmount: number,
	): ServiceCharge => ({
		serviceId,
		serviceName,
		pricingType: "flat",
		unitLabel: null,
		unitPrice: null,
		flatAmount,
		usage: null,
		total: flatAmount,
	});

	const serviceChargesByPaymentId: Record<string, ServiceCharge[]> = {
		"demo-pay-101": [
			variable(
				"demo-svc-elec-a",
				t.electricity,
				t.kwh,
				a.elecUnitA,
				a.pay101ElecUsage,
			),
			variable(
				"demo-svc-water-a",
				t.water,
				t.m3,
				a.waterUnitA,
				a.pay101WaterUsage,
			),
			flat("demo-svc-net-a", t.wifi, a.netFlatA),
			flat("demo-svc-clean-a", t.cleaning, a.cleanFlatA),
			flat("demo-svc-park-a", t.parking, a.parkFlatA),
		],
		"demo-pay-102": [
			variable(
				"demo-svc-elec-a",
				t.electricity,
				t.kwh,
				a.elecUnitA,
				a.pay102ElecUsage,
			),
			variable(
				"demo-svc-water-a",
				t.water,
				t.m3,
				a.waterUnitA,
				a.pay102WaterUsage,
			),
			flat("demo-svc-net-a", t.wifi, a.netFlatA),
			flat("demo-svc-clean-a", t.cleaning, a.cleanFlatA),
		],
		"demo-pay-201": [
			variable(
				"demo-svc-elec-b",
				t.electricity,
				t.kwh,
				a.elecUnitB,
				a.pay201ElecUsage,
			),
			variable(
				"demo-svc-water-b",
				t.water,
				t.m3,
				a.waterUnitB,
				a.pay201WaterUsage,
			),
			flat("demo-svc-net-b", t.wifi, a.netFlatB),
			flat("demo-svc-clean-b", t.cleaning, a.cleanFlatB),
		],
		"demo-pay-202": [
			variable(
				"demo-svc-elec-b",
				t.electricity,
				t.kwh,
				a.elecUnitB,
				a.pay202ElecUsage,
			),
			variable(
				"demo-svc-water-b",
				t.water,
				t.m3,
				a.waterUnitB,
				a.pay202WaterUsage,
			),
			flat("demo-svc-net-b", t.wifi, a.netFlatB),
			flat("demo-svc-clean-b", t.cleaning, a.cleanFlatB),
		],
	};

	const inherited = (svc: PropertyService): EffectiveRoomService => ({
		propertyServiceId: svc.id,
		serviceName: svc.serviceName,
		unitLabel: svc.unitLabel,
		pricingType: svc.pricingType,
		flatAmount: svc.flatAmount,
		unitPrice: svc.unitPrice,
		isEnabled: true,
		isOverridden: false,
	});

	const servicesA = propertyServicesByPropertyId["demo-prop-a"];
	const servicesB = propertyServicesByPropertyId["demo-prop-b"];

	const roomServicesByRoomId: Record<string, EffectiveRoomService[]> = {
		"demo-room-101": servicesA.map(inherited),
		// Demo override: parking disabled for room 102
		"demo-room-102": servicesA.map((svc) =>
			svc.id === "demo-svc-park-a"
				? { ...inherited(svc), isEnabled: false, isOverridden: true }
				: inherited(svc),
		),
		"demo-room-103": servicesA.map(inherited),
		"demo-room-201": servicesB.map(inherited),
		"demo-room-202": servicesB.map(inherited),
	};

	const roomPropertyMap: Record<string, string> = {
		"demo-room-101": "demo-prop-a",
		"demo-room-102": "demo-prop-a",
		"demo-room-103": "demo-prop-a",
		"demo-room-201": "demo-prop-b",
		"demo-room-202": "demo-prop-b",
	};

	return {
		period,
		properties,
		propertyServicesByPropertyId,
		rooms,
		rentPayments,
		serviceChargesByPaymentId,
		roomServicesByRoomId,
		roomPropertyMap,
	};
}

export function buildDemoSeedEn(period: string): DemoSeed {
	return buildTopology(period, EN_TEXTS, EN_AMOUNTS);
}

export function buildDemoSeedVi(period: string): DemoSeed {
	return buildTopology(period, VI_TEXTS, VI_AMOUNTS);
}

export function buildDemoSeed(period: string, locale: Locale = "en"): DemoSeed {
	return locale === "vi" ? buildDemoSeedVi(period) : buildDemoSeedEn(period);
}

export function isDemoSeeded(): boolean {
	const { properties } = usePropertiesStore.getState();
	const { rooms } = useRoomsStore.getState();
	return properties.length > 0 && rooms.length > 0;
}

export function seedDemoStoresIfEmpty(locale: Locale = "en"): void {
	const user = useAuthStore.getState().user;
	if (user) return;
	if (isDemoSeeded()) return;

	const seed = buildDemoSeed(getCurrentPeriod(), locale);

	usePropertiesStore.setState({
		properties: seed.properties,
		isPropertiesLoading: false,
		hasPropertiesFetched: false,
		isPropertiesFetchFailed: false,
	});
	usePropertyServicesStore.setState({
		propertyServicesByPropertyId: seed.propertyServicesByPropertyId,
		isPropertyServicesLoading: false,
		isPropertyServicesFetchFailed: false,
		fetchingPropertyId: null,
	});
	useRoomsStore.setState({
		rooms: seed.rooms,
		isRoomsLoading: false,
		fetchingPropertyId: null,
		fetchingRoomId: null,
		isRoomsFetchFailed: false,
	});
	useRentPaymentsStore.setState({
		rentPayments: seed.rentPayments,
		serviceChargesByPaymentId: seed.serviceChargesByPaymentId,
		isPaymentsLoading: false,
		fetchingRoomId: null,
		isPaymentsFetchFailed: false,
		fetchingRoomChargesId: null,
	});
	useRoomServicesStore.setState({
		roomServicesByRoomId: seed.roomServicesByRoomId,
		roomPropertyMap: seed.roomPropertyMap,
		isRoomServicesLoading: false,
		fetchingRoomId: null,
		isRoomServicesFetchFailed: false,
	});
}
