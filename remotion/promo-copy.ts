import type { Locale } from "@/lib/constants";

export interface PromoCopy {
	painEyebrow: string;
	painHeadline: [string, string];
	pageHeaderTitle: string;
	boardCaption1: string;
	boardCaption2: string;
	paymentRecordsTitle: string;
	paymentRecordsCaption: string;
	includesServices: string;
	rent: string;
	statusPaid: string;
	statusPending: string;
	statusNotRecorded: string;
	paidCount: (paid: number, total: number) => string;
	collected: string;
	finaleTitle: string;
	finaleSubtitle: string;
}

const PROMO_COPY: Record<Locale, PromoCopy> = {
	en: {
		painEyebrow: "For independent landlords",
		painHeadline: ["Still checking who paid", "in spreadsheets?"],
		pageHeaderTitle: "Rent Overview",
		boardCaption1: "See each room and its payment status at a glance",
		boardCaption2: "Watch the board update as you record",
		paymentRecordsTitle: "Payment records",
		paymentRecordsCaption: "Service charges calculated into the rent total",
		includesServices: "inc. services",
		rent: "Rent",
		statusPaid: "Paid",
		statusPending: "Pending",
		statusNotRecorded: "Not recorded",
		paidCount: (paid, total) => `${paid}/${total} paid`,
		collected: "collected",
		finaleTitle: "Track rent with clarity",
		finaleSubtitle: "Try Lumo today",
	},
	vi: {
		painEyebrow: "Dành cho người cho thuê nhà",
		painHeadline: ["Vẫn còn ngồi dò bảng tính", "xem ai đã đóng tiền?"],
		pageHeaderTitle: "Tổng quan tiền thuê",
		boardCaption1: "Xem trạng thái thanh toán của từng phòng trong nháy mắt",
		boardCaption2: "Bảng tự cập nhật ngay khi bạn ghi nhận",
		paymentRecordsTitle: "Lịch sử thanh toán",
		paymentRecordsCaption: "Phí dịch vụ được tính và cộng vào tổng tiền thuê",
		includesServices: "gồm dịch vụ",
		rent: "Tiền thuê",
		statusPaid: "Đã đóng",
		statusPending: "Chờ đóng",
		statusNotRecorded: "Chưa ghi nhận",
		paidCount: (paid, total) => `${paid}/${total} đã đóng`,
		collected: "đã thu",
		finaleTitle: "Theo dõi tiền thuê rõ ràng",
		finaleSubtitle: "Dùng thử Lumo ngay",
	},
};

export function getPromoCopy(locale: Locale = "en"): PromoCopy {
	return PROMO_COPY[locale] ?? PROMO_COPY.en;
}
