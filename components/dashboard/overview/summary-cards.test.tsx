import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { SummaryCards } from "./summary-cards";
import type { OverviewSummary } from "./types";

describe("SummaryCards", () => {
	it("renders three cards with formatted values and subtitles", () => {
		const summary: OverviewSummary = {
			totalRooms: 5,
			paidCount: 2,
			pendingCount: 2,
			collected: 2400,
			pending: 800,
			notRecordedCount: 1,
		};

		renderWithProviders(<SummaryCards summary={summary} />);

		expect(screen.getByText(/collected/i)).toBeInTheDocument();
		expect(screen.getByText("$2,400")).toBeInTheDocument();
		expect(screen.getByText("2 of 5 rooms paid")).toBeInTheDocument();
		expect(screen.getByText(/pending/i)).toBeInTheDocument();
		expect(screen.getByText("$800")).toBeInTheDocument();
		expect(screen.getByText("2 rooms awaiting payment")).toBeInTheDocument();
		expect(screen.getByText(/not recorded/i)).toBeInTheDocument();
		expect(screen.getByText("1 room")).toBeInTheDocument();
	});

	it("uses singular wording for a single pending room", () => {
		const summary: OverviewSummary = {
			totalRooms: 3,
			paidCount: 2,
			pendingCount: 1,
			collected: 100,
			pending: 50,
			notRecordedCount: 0,
		};

		renderWithProviders(<SummaryCards summary={summary} />);

		expect(screen.getByText("1 room awaiting payment")).toBeInTheDocument();
		expect(screen.getByText("2 of 3 rooms paid")).toBeInTheDocument();
	});

	it("formats zero values", () => {
		const summary: OverviewSummary = {
			totalRooms: 0,
			paidCount: 0,
			pendingCount: 0,
			collected: 0,
			pending: 0,
			notRecordedCount: 0,
		};

		renderWithProviders(<SummaryCards summary={summary} />);

		expect(screen.getAllByText("$0")).toHaveLength(2);
		expect(screen.getByText("0 rooms")).toBeInTheDocument();
		expect(screen.getByText("0 of 0 rooms paid")).toBeInTheDocument();
		expect(screen.getByText("0 rooms awaiting payment")).toBeInTheDocument();
	});
});
