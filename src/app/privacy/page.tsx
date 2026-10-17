import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notice — what this studio site collects and what it does not.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <div className="wrap max-w-3xl pt-32 sm:pt-44" aria-labelledby="privacy-title">
      <Reveal>
        <p className="eyebrow">Legal — Privacy</p>
        <h1 id="privacy-title" className="font-display display-2 mt-4 font-semibold">Privacy.</h1>
        <div className="mt-8 space-y-6 leading-relaxed text-[#D8D6D0]">
          <p>This site is designed to collect as little as possible.</p>
          <h2 className="font-display pt-2 text-2xl font-semibold">Inquiries</h2>
          <p>Information you submit through the inquiry form — name, email, and project details — is used solely to respond to your inquiry. It is never sold, shared, or added to a mailing list.</p>
          <h2 className="font-display pt-2 text-2xl font-semibold">Analytics</h2>
          <p>If analytics are enabled in the future, they will be privacy-conscious: aggregate usage only, no cross-site tracking, no unnecessary personal data.</p>
          <h2 className="font-display pt-2 text-2xl font-semibold">Cookies</h2>
          <p>This site sets no marketing cookies. Any strictly necessary storage exists only to keep the site functioning.</p>
          <h2 className="font-display pt-2 text-2xl font-semibold">Contact</h2>
          <p>Questions about privacy can be directed to xsnckp@gmail.com with the subject “Privacy”.</p>
          <p className="meta text-[11px] tracking-[0.18em] text-[#6E6D6A] uppercase">Last updated — 2026</p>
        </div>
      </Reveal>
    </div>
  );
}
