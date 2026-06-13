import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServiceInput } from "@/lib/validations/service";
import { deleteService, updateService } from "./route";

// Mock the server client
const mockGetUser = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockEq2 = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			delete: mockDelete,
			update: mockUpdate,
		})),
	})),
}));

describe("DELETE /api/services/:id", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for delete -> eq -> eq
		mockDelete.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
	});

	const createRequest = (id: string) => {
		return new NextRequest(`http://localhost:3000/api/services/${id}`, {
			method: "DELETE",
		});
	};

	const createParams = (id: string) => ({
		params: Promise.resolve({ id }),
	});

	const mockAuthenticatedUser = () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: "test-user-id" } },
		});
	};

	const mockUnauthenticated = () => {
		mockGetUser.mockResolvedValue({
			data: { user: null },
		});
	};

	it("should return 204 when authenticated user deletes their service", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 1,
		});

		const req = createRequest("svc-1");
		const res = await deleteService(req, createParams("svc-1"));

		expect(res.status).toBe(204);
		expect(mockDelete).toHaveBeenCalledWith({ count: "exact" });
		expect(mockEq).toHaveBeenCalledWith("id", "svc-1");
		expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest("svc-1");
		const res = await deleteService(req, createParams("svc-1"));
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when service is not found", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			error: null,
			count: 0,
		});

		const req = createRequest("non-existent-id");
		const res = await deleteService(req, createParams("non-existent-id"));
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Service not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq2.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest("svc-1");
		const res = await deleteService(req, createParams("svc-1"));
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});

	describe("PATCH /api/services/:id", () => {
		beforeEach(() => {
			vi.clearAllMocks();
			// Chain mocks for update -> eq -> eq -> select -> single
			mockUpdate.mockReturnValue({ eq: mockEq });
			mockEq.mockReturnValue({ eq: mockEq2 });
			mockEq2.mockReturnValue({ select: mockSelect });
			mockSelect.mockReturnValue({ single: mockSingle });
		});

		const createRequest = (
			id: string,
			body: Partial<ServiceInput> | Record<string, unknown>,
		) => {
			return new NextRequest(`http://localhost:3000/api/services/${id}`, {
				method: "PATCH",
				body: JSON.stringify(body),
			});
		};

		const createParams = (id: string) => ({
			params: Promise.resolve({ id }),
		});

		const mockAuthenticatedUser = () => {
			mockGetUser.mockResolvedValue({
				data: { user: { id: "test-user-id" } },
			});
		};

		const mockUnauthenticated = () => {
			mockGetUser.mockResolvedValue({
				data: { user: null },
			});
		};

		it("should return 200 when authenticated user updates service name", async () => {
			mockAuthenticatedUser();
			mockSingle.mockResolvedValue({
				data: {
					id: "svc-1",
					user_id: "test-user-id",
					name: "Updated WiFi",
					unit_label: null,
					pricing_type: "flat",
					flat_amount: 15,
					unit_price: null,
				},
				error: null,
			});

			const req = createRequest("svc-1", { name: "Updated WiFi" });
			const res = await updateService(req, createParams("svc-1"));
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data).toEqual({
				id: "svc-1",
				userId: "test-user-id",
				name: "Updated WiFi",
				unitLabel: null,
				pricingType: "flat",
				flatAmount: 15,
				unitPrice: null,
			});
			expect(mockUpdate).toHaveBeenCalledWith({ name: "Updated WiFi" });
			expect(mockEq).toHaveBeenCalledWith("id", "svc-1");
			expect(mockEq2).toHaveBeenCalledWith("user_id", "test-user-id");
		});

		it("should return 200 when authenticated user updates pricing", async () => {
			mockAuthenticatedUser();
			mockSingle.mockResolvedValue({
				data: {
					id: "svc-1",
					user_id: "test-user-id",
					name: "Electricity",
					unit_label: "kWh",
					pricing_type: "variable",
					flat_amount: null,
					unit_price: 0.2,
				},
				error: null,
			});

			const req = createRequest("svc-1", {
				unitPrice: 0.2,
				pricingType: "variable",
			});
			const res = await updateService(req, createParams("svc-1"));
			const data = await res.json();

			expect(res.status).toBe(200);
			expect(data.unitPrice).toBe(0.2);
			expect(mockUpdate).toHaveBeenCalledWith({
				unit_price: 0.2,
				pricing_type: "variable",
			});
		});

		it("should return 401 when user is not authenticated", async () => {
			mockUnauthenticated();

			const req = createRequest("svc-1", { name: "Updated" });
			const res = await updateService(req, createParams("svc-1"));
			const data = await res.json();

			expect(res.status).toBe(401);
			expect(data.error).toBe("Unauthorized");
		});

		it("should return 400 when name is empty", async () => {
			mockAuthenticatedUser();

			const req = createRequest("svc-1", { name: "" });
			const res = await updateService(req, createParams("svc-1"));
			const data = await res.json();

			expect(res.status).toBe(400);
			expect(data.error).toBeDefined();
		});

		it("should return 404 when service is not found", async () => {
			mockAuthenticatedUser();
			mockSingle.mockResolvedValue({
				data: null,
				error: { code: "PGRST116", message: "No rows found" },
			});

			const req = createRequest("non-existent-id", { name: "Updated" });
			const res = await updateService(req, createParams("non-existent-id"));
			const data = await res.json();

			expect(res.status).toBe(404);
			expect(data.error).toBe("Service not found");
		});

		it("should return 500 when database error occurs", async () => {
			mockAuthenticatedUser();
			mockSingle.mockResolvedValue({
				data: null,
				error: { code: "some-error", message: "DB failure" },
			});

			const req = createRequest("svc-1", { name: "Updated" });
			const res = await updateService(req, createParams("svc-1"));
			const data = await res.json();

			expect(res.status).toBe(500);
			expect(data.error).toBe("Internal Server Error");
		});
	});
});
