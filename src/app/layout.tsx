import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

/**
 * Self-hosted at build time. Replaces the `@import` that was line 1 of
 * globals.css, which could not begin downloading until the parent stylesheet
 * had been fetched and parsed — serialising CSS -> CSS -> font on the critical
 * path, with a third-party DNS lookup and TLS handshake in the middle.
 */
/**
 * All five weights are load-bearing — checked, not assumed:
 *   400  body default (`font-sans` on <body>, plus 11 explicit `font-normal`)
 *   500  136 `font-medium` call sites
 *   600  153 `font-semibold`
 *   700  113 `font-bold`
 *   800   13 `font-extrabold` — the logo lockup in the header and footer of
 *         every page, all three auth pages, the homepage CTA and the wishlist
 *         and media-kit h1s. (The audit note that 800 is "used once" is wrong.)
 * Nothing here is safe to drop.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

/**
 * Money, counts and durations. See the .tnum utility in globals.css.
 *
 * Both weights are reachable: 500 from `tnum font-medium`, 600 from the ten
 * `tnum font-bold` sites (700 has no face, so the matcher falls to 600). But
 * every one of those is behind auth in /dashboard or /admin, and the only
 * public use is two lines on /media-kit — so the two woff2 files have no
 * business being <link rel=preload> on the marketing critical path. Dropping
 * the preload keeps the font exactly where it is used and takes it off the
 * first-load path everywhere else; `display: swap` covers the swap-in.
 */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  preload: false,
  variable: "--font-mono",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://freefornonprofits.com";

const TITLE = "Free For NonProfits — Discover Free Software for Your Nonprofit";
const DESCRIPTION =
  "The ultimate directory of free and discounted software tools for nonprofits. Compare, review, and find the perfect tech stack for your organization.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "nonprofit software",
    "free tools for nonprofits",
    "nonprofit technology",
    "nonprofit CRM",
    "free nonprofit software",
  ],
  alternates: { canonical: "/" },
  /**
   * Previously absent. Every paste of a link into Slack, Teams, LinkedIn or an
   * email list rendered as an unadorned URL with no card.
   */
  openGraph: {
    type: "website",
    siteName: "Free For NonProfits",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        {children}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
