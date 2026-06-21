import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PropertyServiceInput } from "@/lib/validations/property-service";
import { deletePropertyService, updatePropertyService } from "./route";

const PROP_ID = "prop-id";
const USER_ID = "user-id";
const SVC_1_ID = "svc-id-1";
const mockGetUser = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();
const mockEq2 = vi.fn();
const mockEq3 = vi.fn();

vi.mock("@/lib/supabase-server", () => ({
	createSupabaseServerClient: vi.fn(() => ({
		auth: {
			getUser: mockGetUser,
		},
		from: vi.fn(() => ({
			delete: mockDelete,
			update: mockUpdate,
			select: mockSelect,
		})),
	})),
}));

describe("DELETE /api/properties/[id]/services/[serviceId]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDelete.mockReturnValue({ eq: mockEq });
		mockEq.mockReturnValue({ eq: mockEq2 });
		mockEq2.mockReturnValue({ eq: mockEq3 });
	});

	const createRequest = () => {
		return new NextRequest(
			`http://localhost:3000/api/properties/${PROP_ID}/services/${SVC_1_ID}`,
			{ method: "DELETE" },
		);
	};

	const createParams = (id: string, serviceId: string) => ({
		params: Promise.resolve({ id, serviceId }),
	});

	const mockAuthenticatedUser = () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: USER_ID } },
		});
	};

	const mockUnauthenticated = () => {
		mockGetUser.mockResolvedValue({
			data: { user: null },
		});
	};

	it("should return 204 when authenticated user deletes a property service", async () => {
		mockAuthenticatedUser();
		mockEq3.mockResolvedValue({
			error: null,
			count: 1,
		});

		const req = createRequest();
		const res = await deletePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);

		expect(res.status).toBe(204);
		expect(mockDelete).toHaveBeenCalledWith({ count: "exact" });
		expect(mockEq).toHaveBeenCalledWith("property_id", PROP_ID);
		expect(mockEq2).toHaveBeenCalledWith("service_id", SVC_1_ID);
		expect(mockEq3).toHaveBeenCalledWith("user_id", USER_ID);
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest();
		const res = await deletePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 404 when property service is not found", async () => {
		mockAuthenticatedUser();
		mockEq3.mockResolvedValue({
			error: null,
			count: 0,
		});

		const req = createRequest();
		const res = await deletePropertyService(
			req,
			createParams(PROP_ID, "00000000-0000-4000-8000-ffffffffffff"),
		);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Property service not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockEq3.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest();
		const res = await deletePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});

describe("PATCH /api/properties/[id]/services/[serviceId]", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUpdate.mockReturnValue({ eq: mockEq });
		mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle });
		mockEq.mockReturnValue({ eq: mockEq2 });
		mockEq2.mockReturnValue({ eq: mockEq3 });
		mockEq3.mockReturnValue({ select: mockSelect, single: mockSingle });
	});

	const createRequest = (
		body: Partial<PropertyServiceInput> | Record<string, unknown>,
	) => {
		return new NextRequest(
			`http://localhost:3000/api/properties/${PROP_ID}/services/${SVC_1_ID}`,
			{
				method: "PATCH",
				body: JSON.stringify(body),
			},
		);
	};

	const createParams = (id: string, serviceId: string) => ({
		params: Promise.resolve({ id, serviceId }),
	});

	const mockAuthenticatedUser = () => {
		mockGetUser.mockResolvedValue({
			data: { user: { id: USER_ID } },
		});
	};

	const mockUnauthenticated = () => {
		mockGetUser.mockResolvedValue({
			data: { user: null },
		});
	};

	it("should return 200 when updating pricing overrides", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: {
				id: "ps-1",
				property_id: PROP_ID,
				service_id: SVC_1_ID,
				user_id: USER_ID,
				service_name: "WiFi",
				pricing_type: "flat",
				flat_amount: 100,
				unit_price: null,
				unit_label: null,
			},
			error: null,
		});

		const req = createRequest({
			pricingType: "flat",
			flatAmount: 100,
		});
		const res = await updatePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toEqual({
			id: "ps-1",
			propertyId: PROP_ID,
			serviceId: SVC_1_ID,
			userId: USER_ID,
			serviceName: "WiFi",
			pricingType: "flat",
			flatAmount: 100,
			unitPrice: null,
			unitLabel: null,
		});
	});

	it("should return 200 when updating service name", async () => {
		mockAuthenticatedUser();
		// Update chain: update() -> eq() -> eq() -> eq() -> select() -> single()
		mockSingle.mockResolvedValueOnce({
			data: {
				id: "ps-1",
				property_id: PROP_ID,
				service_id: SVC_1_ID,
				user_id: USER_ID,
				service_name: "Updated WiFi",
				pricing_type: null,
				flat_amount: null,
				unit_price: null,
				unit_label: null,
			},
			error: null,
		});

		const req = createRequest({ serviceName: "Updated WiFi" });
		const res = await updatePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data.serviceName).toBe("Updated WiFi");
	});

	it("should return 401 when user is not authenticated", async () => {
		mockUnauthenticated();

		const req = createRequest({ pricingType: "flat" });
		const res = await updatePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(401);
		expect(data.error).toBe("Unauthorized");
	});

	it("should return 400 when pricingType is invalid", async () => {
		mockAuthenticatedUser();

		const req = createRequest({ pricingType: "invalid" });
		const res = await updatePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
	});

	it("should return 404 when property service is not found", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "PGRST116", message: "No rows found" },
		});

		const req = createRequest({ flatAmount: 200 });
		const res = await updatePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(404);
		expect(data.error).toBe("Property service not found");
	});

	it("should return 500 when database error occurs", async () => {
		mockAuthenticatedUser();
		mockSingle.mockResolvedValue({
			data: null,
			error: { code: "some-error", message: "DB failure" },
		});

		const req = createRequest({ flatAmount: 200 });
		const res = await updatePropertyService(
			req,
			createParams(PROP_ID, SVC_1_ID),
		);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
