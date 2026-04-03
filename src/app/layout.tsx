import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free For NonProfits — Discover Free Software for Your Nonprofit",
  description: "The ultimate directory of free and discounted software tools for nonprofits. Compare, review, and find the perfect tech stack for your organization.",
  keywords: ["nonprofit software", "free tools for nonprofits", "nonprofit technology", "nonprofit CRM", "free nonprofit software"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
