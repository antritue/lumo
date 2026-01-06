import { permanentRedirect } from "next/navigation";
import { defaultLocale } from "@/lib/constants";

export default function RootPage() {
	permanentRedirect(`/${defaultLocale}`);
}
