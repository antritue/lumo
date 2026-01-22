import { beforeEach, describe, expect, it } from "vitest";
import { usePropertiesStore } from "./store";

describe("PropertiesStore", () => {
	beforeEach(() => {
		usePropertiesStore.setState({ properties: [] });
	});

	it("creates properties", () => {
		usePropertiesStore.getState().createProperty("First");
		usePropertiesStore.getState().createProperty("Second");

		const { properties } = usePropertiesStore.getState();
		expect(properties).toHaveLength(2);
		expect(properties[0].name).toBe("First");
		expect(properties[1].name).toBe("Second");
	});

	it("updates target property only", () => {
		usePropertiesStore.getState().createProperty("First");
		usePropertiesStore.getState().createProperty("Second");
		const secondId = usePropertiesStore.getState().properties[1].id;

		usePropertiesStore.getState().updateProperty(secondId, "Updated");

		const { properties } = usePropertiesStore.getState();
		expect(properties[0].name).toBe("First");
		expect(properties[1].name).toBe("Updated");
	});

	it("deletes target property only", () => {
		usePropertiesStore.getState().createProperty("Keep");
		usePropertiesStore.getState().createProperty("Delete");
		const deleteId = usePropertiesStore.getState().properties[1].id;

		usePropertiesStore.getState().deleteProperty(deleteId);

		const { properties } = usePropertiesStore.getState();
		expect(properties).toHaveLength(1);
		expect(properties[0].name).toBe("Keep");
	});
});
