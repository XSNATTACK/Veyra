import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { IntroCurtain } from "@/components/intro";
import { RouteTransition } from "@/components/route-transition";
import { ScrollProgress } from "@/components/motion";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Cursor } from "@/components/cursor";
import { site } from "@/config/site";

/* Display voice: Bricolage Grotesque (variable, opsz + wght) — personality. */
const display = localFont({
  src: [
    { path: "../../public/fonts/bricolage-grotesque-var.woff2", weight: "200 800", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
  preload: true,
});
/* Text voice: Instrument Sans (variable) — restraint. General Sans kept as stack fallback. */
const sans = localFont({
  src: [
    { path: "../../public/fonts/instrument-sans-var.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});
/* Accent voice: Instrument Serif italic — editorial contrast, one word per headline. */
const serifAccent = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  variable: "--font-serif-accent",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "VEYRA — Independent Digital Studio", template: "%s — VEYRA" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "VEYRA — Independent Digital Studio",
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "VEYRA — Independent Digital Studio", description: site.description },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/veyra-logo.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/veyra-logo.png", type: "image/png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" className={`${sans.variable} ${display.variable} ${serifAccent.variable}`}>
      <body className="grain flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-[#F4F2ED] focus:px-4 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        {/* Studio decision: motion is always on for every visitor. */}
        <MotionConfig reducedMotion="never">
          <SmoothScroll />
          <Cursor />
          <IntroCurtain />
          <RouteTransition />
          <ScrollProgress />
          <Nav />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </MotionConfig>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "VEYRA",
              description: site.description,
              url: site.url,
              areaServed: "Worldwide",
            }),
          }}
        />
      </body>
    </html>
  );
}
