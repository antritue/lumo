import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { getAppLocale } from "@/lib/app-locale";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin", "vietnamese"],
	display: "swap",
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getAppLocale();

	return (
		<html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased",
					inter.variable,
				)}
			>
				{children}
			</body>
		</html>
	);
}
