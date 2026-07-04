import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FeedbackInput } from "@/lib/validations/feedback";
import { submitFeedback } from "./route";

const mockSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
	Resend: class {
		emails = { send: mockSend };
	},
}));

describe("POST /api/feedback", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createRequest = (body: FeedbackInput) => {
		return new NextRequest("http://localhost:3000/api/feedback", {
			method: "POST",
			body: JSON.stringify(body),
		});
	};

	const validFeedback: FeedbackInput = {
		name: "John Doe",
		email: "john@example.com",
		type: "bug",
		message: "The dashboard is not loading",
	};

	it("should return 201 and send email when valid feedback is submitted", async () => {
		mockSend.mockResolvedValue({ data: { id: "email-id" }, error: null });

		const req = createRequest(validFeedback);
		const res = await submitFeedback(req);
		const data = await res.json();

		expect(res.status).toBe(201);
		expect(data.message).toBe("Feedback sent!");
		expect(mockSend).toHaveBeenCalledOnce();
		expect(mockSend).toHaveBeenCalledWith(
			expect.objectContaining({
				to: process.env.OWNER_EMAIL ?? "",
				subject: "New Feedback: Bug Report",
				text: expect.stringContaining("John Doe"),
			}),
		);
	});

	it("should return 400 when name is missing", async () => {
		const req = createRequest({ ...validFeedback, name: "" });
		const res = await submitFeedback(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
		expect(mockSend).not.toHaveBeenCalled();
	});

	it("should return 400 when email is invalid", async () => {
		const req = createRequest({ ...validFeedback, email: "not-an-email" });
		const res = await submitFeedback(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
		expect(mockSend).not.toHaveBeenCalled();
	});

	it("should return 400 when type is invalid", async () => {
		const req = createRequest({
			...validFeedback,
			type: "invalid" as FeedbackInput["type"],
		});
		const res = await submitFeedback(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
		expect(mockSend).not.toHaveBeenCalled();
	});

	it("should return 400 when message is missing", async () => {
		const req = createRequest({ ...validFeedback, message: "" });
		const res = await submitFeedback(req);
		const data = await res.json();

		expect(res.status).toBe(400);
		expect(data.error).toBeDefined();
		expect(mockSend).not.toHaveBeenCalled();
	});

	it("should return 500 when Resend throws", async () => {
		mockSend.mockRejectedValue(new Error("Resend failure"));

		const req = createRequest(validFeedback);
		const res = await submitFeedback(req);
		const data = await res.json();

		expect(res.status).toBe(500);
		expect(data.error).toBe("Internal Server Error");
	});
});
