import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { useServicesStore } from "@/components/dashboard/services/store";
import { useSettingsStore } from "@/components/dashboard/settings/store";
import { useAuthStore } from "./store";

export function clearAllDomainStores() {
	useAuthStore.getState().clearStore();
	usePropertiesStore.getState().clearStore();
	usePropertyServicesStore.getState().clearStore();
	useRoomsStore.getState().clearStore();
	useRoomServicesStore.getState().clearStore();
	useServicesStore.getState().clearStore();
	useRentPaymentsStore.getState().clearStore();
	useSettingsStore.getState().clearStore();
}
