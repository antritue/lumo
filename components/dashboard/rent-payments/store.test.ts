import { beforeEach, describe, expect, it } from "vitest";
import { useRentPaymentsStore } from "./store";

describe("RentPaymentsStore", () => {
	beforeEach(() => {
		useRentPaymentsStore.setState({ rentPayments: [] });
	});

	it("creates payments with unique IDs", () => {
		useRentPaymentsStore
			.getState()
			.createRentPayment("room-1", "2025-03", 1200);
		useRentPaymentsStore
			.getState()
			.createRentPayment("room-1", "2025-04", 1300);

		const { rentPayments } = useRentPaymentsStore.getState();
		expect(rentPayments).toHaveLength(2);
		expect(rentPayments[0].roomId).toBe("room-1");
		expect(rentPayments[0].period).toBe("2025-03");
		expect(rentPayments[0].amount).toBe(1200);
		expect(rentPayments[0].status).toBe("pending");
		expect(rentPayments[0].id).not.toBe(rentPayments[1].id);
	});

	it("updates target payment only", () => {
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
			.updateRentPayment(firstPaymentId, "2025-05", 1500, "paid");

		const updatedPayments = useRentPaymentsStore.getState().rentPayments;
		expect(updatedPayments).toHaveLength(2);
		expect(updatedPayments[0].period).toBe("2025-05");
		expect(updatedPayments[0].amount).toBe(1500);
		expect(updatedPayments[0].status).toBe("paid");
		expect(updatedPayments[1].period).toBe("2025-04");
		expect(updatedPayments[1].amount).toBe(1300);
	});

	it("deletes target payment only", () => {
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
});
