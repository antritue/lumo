import { beforeEach, describe, expect, it } from "vitest";
import { useRentPaymentsStore } from "./store";

describe("RentPaymentsStore", () => {
	beforeEach(() => {
		useRentPaymentsStore.setState({ rentPayments: [] });
	});

	describe("createRentPayment", () => {
		it("adds rent payment to state", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(1);
			expect(rentPayments[0].roomId).toBe("room-1");
			expect(rentPayments[0].period).toBe("2025-03");
			expect(rentPayments[0].amount).toBe(1200);
		});

		it("generates unique IDs for each payment", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-04", 1200);

			const { rentPayments } = useRentPaymentsStore.getState();
			expect(rentPayments).toHaveLength(2);
			expect(rentPayments[0].id).not.toBe(rentPayments[1].id);
		});
	});

	describe("updateRentPayment", () => {
		it("updates payment period and amount", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);

			const { rentPayments } = useRentPaymentsStore.getState();
			const paymentId = rentPayments[0].id;

			useRentPaymentsStore
				.getState()
				.updateRentPayment(paymentId, "2025-04", 1500);

			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(1);
			expect(updatedPayments[0].id).toBe(paymentId);
			expect(updatedPayments[0].period).toBe("2025-04");
			expect(updatedPayments[0].amount).toBe(1500);
		});

		it("only updates the specified payment", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-04", 1300);

			const { rentPayments } = useRentPaymentsStore.getState();
			const firstPaymentId = rentPayments[0].id;

			useRentPaymentsStore
				.getState()
				.updateRentPayment(firstPaymentId, "2025-05", 1500);

			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(2);
			expect(updatedPayments[0].period).toBe("2025-05");
			expect(updatedPayments[0].amount).toBe(1500);
			expect(updatedPayments[1].period).toBe("2025-04");
			expect(updatedPayments[1].amount).toBe(1300);
		});

		it("does nothing if payment ID does not exist", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);

			const initialPayments = useRentPaymentsStore.getState().rentPayments;

			useRentPaymentsStore
				.getState()
				.updateRentPayment("non-existent-id", "2025-04", 1500);

			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toEqual(initialPayments);
		});
	});

	describe("deleteRentPayment", () => {
		it("removes payment from state", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);

			const { rentPayments } = useRentPaymentsStore.getState();
			const paymentId = rentPayments[0].id;

			useRentPaymentsStore.getState().deleteRentPayment(paymentId);

			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(0);
		});

		it("only removes the specified payment", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-04", 1300);

			const { rentPayments } = useRentPaymentsStore.getState();
			const firstPaymentId = rentPayments[0].id;

			useRentPaymentsStore.getState().deleteRentPayment(firstPaymentId);

			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toHaveLength(1);
			expect(updatedPayments[0].period).toBe("2025-04");
			expect(updatedPayments[0].amount).toBe(1300);
		});

		it("does nothing if payment ID does not exist", () => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);

			const initialPayments = useRentPaymentsStore.getState().rentPayments;

			useRentPaymentsStore.getState().deleteRentPayment("non-existent-id");

			const updatedPayments = useRentPaymentsStore.getState().rentPayments;
			expect(updatedPayments).toEqual(initialPayments);
		});
	});

	describe("filtering and sorting", () => {
		beforeEach(() => {
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-03", 1200);
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-2", "2025-03", 1500);
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-04", 1200);
			useRentPaymentsStore
				.getState()
				.createRentPayment("room-1", "2025-02", 1200);
		});

		it("can filter payments by roomId", () => {
			const allPayments = useRentPaymentsStore.getState().rentPayments;
			const payments = allPayments.filter((p) => p.roomId === "room-1");

			expect(payments).toHaveLength(3);
			expect(payments.every((p) => p.roomId === "room-1")).toBe(true);
		});

		it("can sort payments by period in descending order", () => {
			const allPayments = useRentPaymentsStore.getState().rentPayments;
			const payments = allPayments
				.filter((p) => p.roomId === "room-1")
				.sort((a, b) => b.period.localeCompare(a.period));

			expect(payments[0].period).toBe("2025-04");
			expect(payments[1].period).toBe("2025-03");
			expect(payments[2].period).toBe("2025-02");
		});
	});
});
