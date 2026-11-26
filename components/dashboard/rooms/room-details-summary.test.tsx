import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Tenant } from "@/components/dashboard/tenants/types";
import { renderWithProviders } from "@/test/render";
import { RoomDetailsSummary } from "./room-details-summary";

describe("RoomDetailsSummary", () => {
	const tenant: Tenant = {
		id: "tenant-1",
		userId: "",
		roomId: "room-1",
		fullName: "Anh Nguyen",
		phone: "0901 234 567",
		email: "anh@example.com",
		notes: null,
	};

	it("renders tenant and notes as compact rows without disclosures", () => {
		renderWithProviders(
			<RoomDetailsSummary tenant={tenant} notes="Test notes" />,
		);

		expect(screen.getByText("Tenant")).toBeInTheDocument();
		expect(screen.getByText("Note")).toBeInTheDocument();
		expect(screen.getByText("Test notes")).toBeInTheDocument();

		const name = screen.getByText("Anh Nguyen");
		const phone = screen.getByText("0901 234 567");
		const email = screen.getByText("anh@example.com");
		expect(name.parentElement).toBe(phone.parentElement);
		expect(name.parentElement).toBe(email.parentElement);

		expect(
			screen.queryByRole("button", { name: /current tenant/i }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /notes/i }),
		).not.toBeInTheDocument();
	});

	it("renders a tenant skeleton without hiding the notes while loading", () => {
		const { container } = renderWithProviders(
			<RoomDetailsSummary tenant={null} notes="Test notes" isTenantLoading />,
		);

		expect(screen.getByText("Tenant")).toBeInTheDocument();
		expect(screen.getByText("Note")).toBeInTheDocument();
		expect(screen.getByText("Test notes")).toBeInTheDocument();
		expect(container.querySelector(".animate-shimmer")).toBeInTheDocument();
	});

	it("renders a retry when the tenant fetch failed", async () => {
		const user = userEvent.setup();
		const onRetryTenant = vi.fn();
		renderWithProviders(
			<RoomDetailsSummary
				tenant={null}
				notes={null}
				isTenantFetchFailed
				onRetryTenant={onRetryTenant}
			/>,
		);

		expect(screen.getByText("Tenant")).toBeInTheDocument();
		expect(screen.getByText("Could not load tenant")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Try again" }));

		expect(onRetryTenant).toHaveBeenCalledOnce();
	});

	it("omits missing contact details and separators", () => {
		const { container } = renderWithProviders(
			<RoomDetailsSummary
				tenant={{ ...tenant, phone: null, email: null }}
				notes={null}
			/>,
		);

		expect(screen.getByText("Anh Nguyen")).toBeInTheDocument();
		expect(screen.queryByText("0901 234 567")).not.toBeInTheDocument();
		expect(screen.queryByText("anh@example.com")).not.toBeInTheDocument();
		expect(container.textContent).not.toContain("·");
	});

	it("renders nothing when tenant and notes are absent", () => {
		const { container } = renderWithProviders(
			<RoomDetailsSummary tenant={null} notes="   " />,
		);

		expect(container).toBeEmptyDOMElement();
	});

	it("clamps long notes and toggles the full text", async () => {
		const user = userEvent.setup();
		const longNotes = "Long note ".repeat(20);
		renderWithProviders(<RoomDetailsSummary tenant={null} notes={longNotes} />);

		const notes = screen.getByText(longNotes.trim());
		expect(notes).toHaveClass("line-clamp-2");
		await user.click(screen.getByRole("button", { name: "Show more" }));
		expect(notes).not.toHaveClass("line-clamp-2");
		expect(
			screen.getByRole("button", { name: "Show less" }),
		).toBeInTheDocument();
	});
});
