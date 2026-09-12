import type { User } from "@supabase/supabase-js";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { DemoSeedInitializer } from "@/components/dashboard/demo/demo-seed-initializer";
import { useOverviewStore } from "@/components/dashboard/overview/store";
import type {
	OverviewSnapshot,
	OverviewSummary,
} from "@/components/dashboard/overview/types";
import { usePropertyServicesStore } from "@/components/dashboard/properties/property-services-store";
import { usePropertiesStore } from "@/components/dashboard/properties/store";
import { useRentPaymentsStore } from "@/components/dashboard/rent-payments/store";
import { useRoomServicesStore } from "@/components/dashboard/rooms/room-services-store";
import { useRoomsStore } from "@/components/dashboard/rooms/store";
import { getCurrentPeriod, seedDemoStoresIfEmpty } from "@/lib/demo-seed";
import { renderWithProviders } from "@/test/render";
import OverviewPage from "./page";

const snapshotFixture: OverviewSnapshot = {
	period: "2026-08",
	properties: [
		{
			id: "prop-1",
			name: "Sunset Villa",
			rooms: [
				{
					id: "room-1",
					propertyId: "prop-1",
					name: "Room 101",
					monthlyRent: 800,
					payment: {
						id: "pay-1",
						roomId: "room-1",
						period: "2026-08",
						rentAmount: 800,
						status: "paid",
					},
					charges: [],
					total: 800,
				},
				{
					id: "room-2",
					propertyId: "prop-1",
					name: "Room 102",
					monthlyRent: 700,
					payment: null,
					charges: [],
					total: 0,
				},
			],
			paidCount: 1,
		},
	],
	rooms: [
		{
			id: "room-1",
			propertyId: "prop-1",
			name: "Room 101",
			monthlyRent: 800,
			payment: {
				id: "pay-1",
				roomId: "room-1",
				period: "2026-08",
				rentAmount: 800,
				status: "paid",
			},
			charges: [],
			total: 800,
		},
		{
			id: "room-2",
			propertyId: "prop-1",
			name: "Room 102",
			monthlyRent: 700,
			payment: null,
			charges: [],
			total: 0,
		},
	],
};

const summaryFixture: OverviewSummary = {
	totalRooms: 2,
	paidCount: 1,
	pendingCount: 0,
	collected: 800,
	pending: 0,
	notRecordedCount: 1,
};

const fetchOverviewSpy = vi.fn();

describe("OverviewPage", () => {
	beforeEach(() => {
		useAuthStore.setState({ user: null, loading: false });
		useOverviewStore.setState({
			period: null,
			snapshot: null,
			summary: null,
			isOverviewLoading: false,
			hasOverviewFetched: false,
			isOverviewFetchFailed: false,
			togglingPaymentId: null,
			fetchOverview: fetchOverviewSpy,
		});
		fetchOverviewSpy.mockReset();
	});

	it("fetches the default period on mount", () => {
		renderWithProviders(<OverviewPage />);

		expect(fetchOverviewSpy).toHaveBeenCalledTimes(1);
		expect(fetchOverviewSpy.mock.calls[0][0]).toMatch(
			/^\d{4}-(0[1-9]|1[0-2])$/,
		);
	});

	describe("when fetching overview failed", () => {
		it("shows error state with retry button", () => {
			useOverviewStore.setState({
				isOverviewFetchFailed: true,
				isOverviewLoading: false,
				hasOverviewFetched: true,
			});

			renderWithProviders(<OverviewPage />);

			expect(
				screen.getByRole("heading", { name: /failed to load data/i }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: /try again/i }),
			).toBeInTheDocument();
		});

		it("retries fetchOverview on click", async () => {
			const user = userEvent.setup();
			useOverviewStore.setState({
				isOverviewFetchFailed: true,
				isOverviewLoading: false,
				hasOverviewFetched: true,
			});

			renderWithProviders(<OverviewPage />);

			await user.click(screen.getByRole("button", { name: /try again/i }));

			expect(fetchOverviewSpy).toHaveBeenCalledTimes(2);
		});
	});

	describe("while overview is loading", () => {
		it("shows skeleton", () => {
			useOverviewStore.setState({ isOverviewLoading: true });

			const { container } = renderWithProviders(<OverviewPage />);

			expect(
				container.querySelectorAll(".animate-shimmer").length,
			).toBeGreaterThan(0);
		});
	});

	describe("when there are no rooms", () => {
		it("shows empty state", () => {
			useOverviewStore.setState({
				hasOverviewFetched: true,
				isOverviewLoading: false,
				snapshot: { period: "2026-08", properties: [], rooms: [] },
				summary: {
					totalRooms: 0,
					paidCount: 0,
					pendingCount: 0,
					collected: 0,
					pending: 0,
					notRecordedCount: 0,
				},
			});

			renderWithProviders(<OverviewPage />);

			expect(
				screen.getByRole("heading", { name: /no rooms to display/i }),
			).toBeInTheDocument();
		});
	});

	describe("when rooms exist", () => {
		it("renders summary cards, property groups and room rows", () => {
			useOverviewStore.setState({
				hasOverviewFetched: true,
				isOverviewLoading: false,
				snapshot: snapshotFixture,
				summary: summaryFixture,
			});

			renderWithProviders(<OverviewPage />);

			expect(screen.getByText("Collected")).toBeInTheDocument();
			expect(screen.getByText("Sunset Villa")).toBeInTheDocument();
			expect(screen.getByText("Room 101")).toBeInTheDocument();
			expect(screen.getByText("Room 102")).toBeInTheDocument();
		});

		it("refetches when the month changes", async () => {
			const user = userEvent.setup();
			useOverviewStore.setState({
				hasOverviewFetched: true,
				isOverviewLoading: false,
				snapshot: snapshotFixture,
				summary: summaryFixture,
			});

			renderWithProviders(<OverviewPage />);

			await user.click(screen.getByRole("combobox"));

			const marchButton = screen.getByRole("button", { name: /mar/i });
			await user.click(marchButton);

			const today = new Date();
			expect(fetchOverviewSpy).toHaveBeenCalledWith(
				`${today.getFullYear()}-03`,
				true,
			);
		});
	});

	describe("integration", () => {
		const realFetchOverview = useOverviewStore.getState().fetchOverview;
		const mockFetch = vi.fn();

		beforeEach(() => {
			global.fetch = mockFetch;
			mockFetch.mockReset();
			usePropertiesStore.getState().clearStore();
			usePropertyServicesStore.getState().clearStore();
			useRoomsStore.getState().clearStore();
			useRoomServicesStore.getState().clearStore();
			useRentPaymentsStore.getState().clearStore();
			useOverviewStore.getState().clearStore();
			useOverviewStore.setState({ fetchOverview: realFetchOverview });
			useAuthStore.setState({ user: null, loading: false });
		});

		it("shows seeded data for guests", async () => {
			renderWithProviders(
				<>
					<DemoSeedInitializer />
					<OverviewPage />
				</>,
			);

			await waitFor(() => {
				expect(screen.getByText("Room 101")).toBeInTheDocument();
			});
			expect(useOverviewStore.getState().snapshot?.rooms).toHaveLength(5);
		});

		it("fetches real data when user logs in on the page", async () => {
			seedDemoStoresIfEmpty("en");
			renderWithProviders(<OverviewPage />);
			await waitFor(() => {
				expect(screen.getByText("Room 101")).toBeInTheDocument();
			});

			const period = getCurrentPeriod();
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					period,
					properties: [{ id: "real-prop", name: "Real Villa" }],
					rooms: [
						{
							id: "real-room",
							propertyId: "real-prop",
							name: "Real Room",
							monthlyRent: 800,
							payment: null,
							charges: [],
							total: 0,
						},
					],
				}),
			});

			useAuthStore.getState().setUser({ id: "user-1" } as unknown as User);

			await waitFor(() => {
				expect(screen.getByText("Real Room")).toBeInTheDocument();
			});
		});

		it("does not refetch when the same user id is set again", async () => {
			const period = getCurrentPeriod();
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => ({ period, properties: [], rooms: [] }),
			});

			useAuthStore.setState({
				user: { id: "user-1" } as unknown as User,
				loading: false,
			});
			renderWithProviders(<OverviewPage />);
			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalledTimes(1);
			});

			useAuthStore.getState().setUser({ id: "user-1" } as unknown as User);

			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});
	});
});
