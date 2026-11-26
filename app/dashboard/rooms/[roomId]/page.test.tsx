import type { User } from "@supabase/supabase-js";
import { screen, waitFor } from "@testing-library/react";
import { use } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { useTenantsStore } from "@/components/dashboard/tenants/store";
import { renderWithProviders } from "@/test/render";
import RoomDetailPage from "./page";

vi.mock("next/navigation", () => ({
	useRouter: vi.fn(() => ({ push: vi.fn() })),
	useSearchParams: () => new URLSearchParams(),
}));

// Mock React's use hook
vi.mock("react", async () => {
	const actual = await vi.importActual("react");
	return {
		...actual,
		use: vi.fn(),
	};
});

const mockUse = use as ReturnType<typeof vi.fn>;

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the room data
const mockRoom = {
	id: "room-1",
	propertyId: "prop-1",
	name: "Master Bedroom",
	monthlyRent: 1200,
	notes: "Large room with balcony",
};

// Helper to create params promise
const createParams = (roomId: string) => ({
	params: Promise.resolve({ roomId }),
});

describe("RoomDetailPage", () => {
	beforeEach(() => {
		useRoomsStore.setState({
			rooms: [],
			isRoomsLoading: false,
			isRoomsFetchFailed: false,
		});
		useAuthStore.setState({ user: null, loading: false });
		useTenantsStore.setState({
			tenants: [],
			isTenantsLoading: false,
			hasTenantsFetched: false,
			isTenantsFetchFailed: false,
			fetchingTenantRoomId: null,
			failedTenantRoomId: null,
		});
		vi.clearAllMocks();
		mockFetch.mockResolvedValue({ ok: true, json: async () => [] });
	});

	it("displays loading skeleton while auth is loading", () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useAuthStore.setState({ loading: true, user: null });

		const { container } = renderWithProviders(
			<RoomDetailPage {...createParams("room-1")} />,
		);

		const skeletonElements = container.querySelectorAll(".animate-shimmer");
		expect(skeletonElements.length).toBeGreaterThan(0);
	});

	it("displays loading skeleton while room is fetching", () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useAuthStore.setState({
			user: { id: "user-1" } as User,
			loading: false,
		});
		useRoomsStore.setState({ isRoomsLoading: true });

		const { container } = renderWithProviders(
			<RoomDetailPage {...createParams("room-1")} />,
		);

		const skeletonElements = container.querySelectorAll(".animate-shimmer");
		expect(skeletonElements.length).toBeGreaterThan(0);
	});

	it("fetches room by ID when user is authenticated", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useAuthStore.setState({
			user: { id: "user-1" } as User,
			loading: false,
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});
	});

	it("fetches and displays the current tenant for the room", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useAuthStore.setState({
			user: { id: "user-1" } as User,
			loading: false,
		});

		mockFetch.mockImplementation((input: RequestInfo | URL) => {
			const url = String(input);
			if (url === "/api/rooms/room-1/tenant") {
				return Promise.resolve({
					ok: true,
					json: async () => ({
						id: "tenant-1",
						userId: "user-1",
						roomId: "room-1",
						fullName: "Anh Nguyen",
						phone: null,
						email: null,
						notes: null,
					}),
				});
			}
			if (url === "/api/rooms/room-1") {
				return Promise.resolve({ ok: true, json: async () => mockRoom });
			}
			return Promise.resolve({ ok: true, json: async () => [] });
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/rooms/room-1/tenant",
				expect.objectContaining({
					method: "GET",
					credentials: "include",
				}),
			);
		});
		expect(await screen.findByText("Anh Nguyen")).toBeInTheDocument();
	});

	it("does not fetch room when user is not authenticated", () => {
		mockUse.mockReturnValue({ roomId: "room-1" });

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(mockFetch).not.toHaveBeenCalled();
	});

	it("displays room not found when room does not exist", async () => {
		mockUse.mockReturnValue({ roomId: "non-existent" });
		renderWithProviders(<RoomDetailPage {...createParams("non-existent")} />);

		expect(
			await screen.findByRole("heading", { name: /room not found/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to properties/i }),
		).toBeInTheDocument();
	});

	it("does not block the room detail while tenants are loading", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useAuthStore.setState({
			user: { id: "user-1" } as User,
			loading: false,
		});
		mockFetch.mockImplementation((input: RequestInfo | URL) => {
			const url = String(input);
			if (url === "/api/rooms/room-1/tenant") return new Promise(() => {});
			if (url === "/api/rooms/room-1") {
				return Promise.resolve({ ok: true, json: async () => mockRoom });
			}
			return Promise.resolve({ ok: true, json: async () => [] });
		});

		const { container } = renderWithProviders(
			<RoomDetailPage {...createParams("room-1")} />,
		);

		expect(
			await screen.findByRole("heading", { name: "Master Bedroom" }),
		).toBeInTheDocument();
		expect(screen.getByText("Large room with balcony")).toBeInTheDocument();
		expect(screen.getByText("Tenant")).toBeInTheDocument();
		expect(container.querySelector(".animate-shimmer")).toBeInTheDocument();
	});

	it("displays room detail when room exists", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useRoomsStore.setState({
			rooms: [mockRoom],
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(
			await screen.findByRole("heading", { name: "Master Bedroom" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /back to properties/i }),
		).toBeInTheDocument();
	});

	it("displays error state when fetch fails", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useRoomsStore.setState({ isRoomsFetchFailed: true });

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(
			screen.getByRole("heading", { name: /failed to load data/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /try again/i }),
		).toBeInTheDocument();
	});

	it("shows room notes when present", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useRoomsStore.setState({
			rooms: [mockRoom],
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(await screen.findByText("Note")).toBeInTheDocument();
		expect(screen.getByText("Large room with balcony")).toBeInTheDocument();
	});

	it("displays rent payments section", async () => {
		mockUse.mockReturnValue({ roomId: "room-1" });
		useRoomsStore.setState({
			rooms: [mockRoom],
		});

		renderWithProviders(<RoomDetailPage {...createParams("room-1")} />);

		expect(await screen.findByText("Payment Records")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /add payment record/i }),
		).toBeInTheDocument();
	});
});
