import { beforeEach, describe, expect, it } from "vitest";
import { useRoomsStore } from "./store";

describe("RoomsStore", () => {
	beforeEach(() => {
		useRoomsStore.setState({ rooms: [] });
	});

	describe("createRoom", () => {
		it("adds room to state", () => {
			useRoomsStore.getState().createRoom("prop-1", "Master Bedroom");

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0].name).toBe("Master Bedroom");
			expect(rooms[0].propertyId).toBe("prop-1");
		});

		it("adds room with optional fields", () => {
			useRoomsStore
				.getState()
				.createRoom("prop-1", "Suite", 1500, "Corner unit");

			const { rooms } = useRoomsStore.getState();
			expect(rooms[0]).toMatchObject({
				name: "Suite",
				monthlyRent: 1500,
				notes: "Corner unit",
			});
		});
	});

	describe("updateRoom", () => {
		it("updates room name", () => {
			useRoomsStore.getState().createRoom("prop-1", "Original", 1000);
			const id = useRoomsStore.getState().rooms[0].id;

			useRoomsStore.getState().updateRoom(id, "Updated");

			expect(useRoomsStore.getState().rooms[0].name).toBe("Updated");
		});

		it("updates all fields", () => {
			useRoomsStore.getState().createRoom("prop-1", "Original", 1000, "Old");
			const id = useRoomsStore.getState().rooms[0].id;

			useRoomsStore.getState().updateRoom(id, "Updated", 1500, "New");

			expect(useRoomsStore.getState().rooms[0]).toMatchObject({
				name: "Updated",
				monthlyRent: 1500,
				notes: "New",
			});
		});

		it("updates only target room", () => {
			useRoomsStore.getState().createRoom("prop-1", "Room 1");
			useRoomsStore.getState().createRoom("prop-1", "Room 2");
			const targetId = useRoomsStore.getState().rooms[1].id;

			useRoomsStore.getState().updateRoom(targetId, "Updated");

			const { rooms } = useRoomsStore.getState();
			expect(rooms[0].name).toBe("Room 1");
			expect(rooms[1].name).toBe("Updated");
		});
	});

	describe("deleteRoom", () => {
		it("removes room", () => {
			useRoomsStore.getState().createRoom("prop-1", "To Delete");
			const id = useRoomsStore.getState().rooms[0].id;

			useRoomsStore.getState().deleteRoom(id);

			expect(useRoomsStore.getState().rooms).toHaveLength(0);
		});

		it("removes only target room", () => {
			useRoomsStore.getState().createRoom("prop-1", "Keep");
			useRoomsStore.getState().createRoom("prop-1", "Delete");
			const deleteId = useRoomsStore.getState().rooms[1].id;

			useRoomsStore.getState().deleteRoom(deleteId);

			const { rooms } = useRoomsStore.getState();
			expect(rooms).toHaveLength(1);
			expect(rooms[0].name).toBe("Keep");
		});
	});

	describe("getRoomById", () => {
		it("returns room when found", () => {
			useRoomsStore.getState().createRoom("prop-1", "Target Room", 1500);
			const id = useRoomsStore.getState().rooms[0].id;

			const result = useRoomsStore.getState().getRoomById(id);

			expect(result?.name).toBe("Target Room");
			expect(result?.monthlyRent).toBe(1500);
		});

		it("returns undefined when not found", () => {
			const result = useRoomsStore.getState().getRoomById("fake-id");

			expect(result).toBeUndefined();
		});
	});
});
