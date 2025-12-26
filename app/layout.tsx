import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumo - Simple Rent Tracking",
  description: "Lumo helps small landlords stay organized by tracking rent, rooms, and tenants in one simple app. No spreadsheets, no stress.",
  keywords: ["rent tracking", "landlord app", "property management", "small landlord", "rent reminder"],
  openGraph: {
    title: "Lumo - Simple Rent Tracking",
    description: "Lumo helps small landlords stay organized by tracking rent, rooms, and tenants in one simple app.",
    type: "website",
    locale: "en_US",
    siteName: "Lumo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumo - Simple Rent Tracking",
    description: "Lumo helps small landlords stay organized by tracking rent, rooms, and tenants in one simple app.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
