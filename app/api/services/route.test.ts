import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ServiceInput } from "@/lib/validations/service";
import { createService, listServices } from "./route";

// Mock the server client
const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			insert: mockInsert,
			select: mockSelect,
		})),
	})),
}));

	describe("GET /api/services", () => {
		beforeEach(() => {
			vi.clearAllMocks();
			// Chain mocks for select -> eq
			mockSelect.mockReturnValue({ eq: mockEq });
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

	it("should return 200 with list of services for authenticated user", async () => {
		mockAuthenticatedUser();
		const mockServices = [
			{
				id: "svc-1",
				user_id: "test-user-id",
				name: "Electricity",
				unit_label: "kWh",
				pricing_type: "variable",
				flat_amount: null,
				unit_price: null,
			},
			{
				id: "svc-2",
				user_id: "test-user-id",
				name: "Water",
				unit_label: "m³",
				pricing_type: "variable",
				flat_amount: null,
				unit_price: null,
			},
		];
		mockEq.mockResolvedValue({
			data: mockServices,
			error: null,
		});

		const res = await listServices();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual([
			{
				id: "svc-1",
				userId: "test-user-id",
				name: "Electricity",
				unitLabel: "kWh",
				pricingType: "variable",
				flatAmount: null,
				unitPrice: null,
			},
			{
				id: "svc-2",
				userId: "test-user-id",
				name: "Water",
				unitLabel: "m³",
				pricingType: "variable",
				flatAmount: null,
				unitPrice: null,
			},
		]);
		expect(mockSelect).toHaveBeenCalledWith("*");
		expect(mockEq).toHaveBeenCalledWith("user_id", "test-user-id");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const res = await listServices();
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const res = await listServices();
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("POST /api/services", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Chain mocks for insert -> select -> single
		mockInsert.mockReturnValue({ select: mockSelect });
		mockSelect.mockReturnValue({ single: mockSingle });
	});

	const createRequest = (body: ServiceInput | Record<string, unknown>) => {
		return new NextRequest("http://localhost:3000/api/services", {
			method: "POST",
			body: JSON.stringify(body),
		});
	};

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

	it("should return 201 when authenticated user creates a service", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: {
				id: "new-svc-id",
				user_id: "test-user-id",
				name: "WiFi",
				unit_label: null,
				pricing_type: "flat",
				flat_amount: 15,
				unit_price: null,
			},
			error: null,
		});

		const req = createRequest({
			name: "WiFi",
			pricingType: "flat",
			flatAmount: 15,
		});
		const res = await createService(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data).toEqual({
			id: "new-svc-id",
			userId: "test-user-id",
			name: "WiFi",
			unitLabel: null,
			pricingType: "flat",
			flatAmount: 15,
			unitPrice: null,
		});
		expect(mockInsert).toHaveBeenCalledWith([
			{
				user_id: "test-user-id",
				name: "WiFi",
				unit_label: null,
				pricing_type: "flat",
				flat_amount: 15,
				unit_price: null,
			},
		]);
	});

	it("should return 201 with variable pricing service", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: {
				id: "new-svc-id",
				user_id: "test-user-id",
				name: "Electricity",
				unit_label: "kWh",
				pricing_type: "variable",
				flat_amount: null,
				unit_price: 0.15,
			},
			error: null,
		});

		const req = createRequest({
			name: "Electricity",
			unitLabel: "kWh",
			pricingType: "variable",
			unitPrice: 0.15,
		});
		const res = await createService(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.pricingType).toBe("variable");
		expect(data.unitPrice).toBe(0.15);
		expect(mockInsert).toHaveBeenCalledWith([
			{
				user_id: "test-user-id",
				name: "Electricity",
				unit_label: "kWh",
				pricing_type: "variable",
				flat_amount: null,
				unit_price: 0.15,
			},
		]);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({ name: "WiFi", pricingType: "flat" });
		const res = await createService(req);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when name is missing", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ pricingType: "flat" });
		const res = await createService(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 400 when pricingType is invalid", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ name: "Test", pricingType: "invalid" });
		const res = await createService(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest({ name: "WiFi", pricingType: "flat" });
		const res = await createService(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
