import { beforeEach, describe, expect, it } from "vitest";
import { usePropertiesStore } from "./store";

describe("PropertiesStore", () => {
	beforeEach(() => {
		usePropertiesStore.setState({ properties: [] });
	});

	describe("createProperty", () => {
		it("adds property to state", () => {
			usePropertiesStore.getState().createProperty("Sunset Villa");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0].name).toBe("Sunset Villa");
		});

		it("adds multiple properties", () => {
			usePropertiesStore.getState().createProperty("First");
			usePropertiesStore.getState().createProperty("Second");

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(2);
		});
	});

	describe("updateProperty", () => {
		it("updates property name", () => {
			usePropertiesStore.getState().createProperty("Original");
			const id = usePropertiesStore.getState().properties[0].id;

			usePropertiesStore.getState().updateProperty(id, "Updated");

			expect(usePropertiesStore.getState().properties[0].name).toBe("Updated");
		});

		it("updates only target property", () => {
			usePropertiesStore.getState().createProperty("First");
			usePropertiesStore.getState().createProperty("Second");
			const secondId = usePropertiesStore.getState().properties[1].id;

			usePropertiesStore.getState().updateProperty(secondId, "Updated");

			const { properties } = usePropertiesStore.getState();
			expect(properties[0].name).toBe("First");
			expect(properties[1].name).toBe("Updated");
		});
	});

	describe("deleteProperty", () => {
		it("removes property", () => {
			usePropertiesStore.getState().createProperty("To Delete");
			const id = usePropertiesStore.getState().properties[0].id;

			usePropertiesStore.getState().deleteProperty(id);

			expect(usePropertiesStore.getState().properties).toHaveLength(0);
		});

		it("removes only target property", () => {
			usePropertiesStore.getState().createProperty("Keep");
			usePropertiesStore.getState().createProperty("Delete");
			const deleteId = usePropertiesStore.getState().properties[1].id;

			usePropertiesStore.getState().deleteProperty(deleteId);

			const { properties } = usePropertiesStore.getState();
			expect(properties).toHaveLength(1);
			expect(properties[0].name).toBe("Keep");
		});
	});
});
