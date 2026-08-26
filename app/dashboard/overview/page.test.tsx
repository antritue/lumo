import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOverviewStore } from "@/components/dashboard/overview/store";
import type {
	OverviewSnapshot,
	OverviewSummary,
} from "@/components/dashboard/overview/types";
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

	it("shows the skeleton while loading", () => {
		useOverviewStore.setState({ isOverviewLoading: true });

		const { container } = renderWithProviders(<OverviewPage />);

		expect(
			container.querySelectorAll(".animate-shimmer").length,
		).toBeGreaterThan(0);
	});

	it("shows the error state when fetching failed", () => {
		useOverviewStore.setState({
			isOverviewFetchFailed: true,
			isOverviewLoading: false,
			hasOverviewFetched: false,
		});

		renderWithProviders(<OverviewPage />);

		expect(
			screen.getByRole("heading", { name: /failed to load data/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /try again/i }),
		).toBeInTheDocument();
	});

	it("retries fetching on retry click", async () => {
		const user = userEvent.setup();
		useOverviewStore.setState({
			isOverviewFetchFailed: true,
			isOverviewLoading: false,
			hasOverviewFetched: false,
		});

		renderWithProviders(<OverviewPage />);

		await user.click(screen.getByRole("button", { name: /try again/i }));

		expect(fetchOverviewSpy).toHaveBeenCalledTimes(2);
	});

	it("shows the empty state when there are no rooms", () => {
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

	it("renders summary cards, property groups and room rows", () => {
		useOverviewStore.setState({
			hasOverviewFetched: true,
			isOverviewLoading: false,
			snapshot: snapshotFixture,
			summary: summaryFixture,
		});

		renderWithProviders(<OverviewPage />);

		expect(screen.getByText(/collected/i)).toBeInTheDocument();
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
		expect(fetchOverviewSpy).toHaveBeenCalledWith(`${today.getFullYear()}-03`);
	});
});
