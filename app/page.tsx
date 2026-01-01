import { permanentRedirect } from "next/navigation";
import { defaultLocale } from "@/i18n";

export default function RootPage() {
	permanentRedirect(`/${defaultLocale}`);
}
