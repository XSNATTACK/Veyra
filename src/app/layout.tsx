import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/next";
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

const title = "VEYRA — Web Design & Development Studio";

export const viewport: Viewport = {
  // Matches the site chrome — darkens browser UI on mobile.
  themeColor: "#0A0A0B",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s — VEYRA" },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  category: "Web design & development",
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    description: site.description,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  // Google Search Console verification via HTML meta tag (DNS TXT is not
  // available on *.vercel.app). Set GOOGLE_SITE_VERIFICATION in the Vercel
  // project's environment variables before the next deploy to emit it.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

/** Entity graph — Organization + WebSite, cross-referenced by @id from page-level schema. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      alternateName: "Veyra Studio",
      url: `${site.url}/`,
      logo: { "@type": "ImageObject", url: `${site.url}${site.logo}` },
      description: site.description,
      email: site.email,
      slogan: "Digital products, built with intent.",
      areaServed: "Worldwide",
      knowsAbout: [
        "Web design",
        "Web development",
        "Web applications",
        "Digital products",
        "UI/UX design",
        "Motion design",
        "Next.js",
        "React",
        "TypeScript",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: `${site.url}/`,
      name: site.name,
      description: site.description,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#organization` },
    },
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
