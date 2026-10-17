import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms — how content on this studio site may be used.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <div className="wrap max-w-3xl pt-32 sm:pt-44" aria-labelledby="terms-title">
      <Reveal>
        <p className="eyebrow">Legal — Terms</p>
        <h1 id="terms-title" className="font-display display-2 mt-4 font-semibold">Terms.</h1>
        <div className="mt-8 space-y-6 leading-relaxed text-[#D8D6D0]">
          <p>All content on this site — copy, design, and code — belongs to the studio unless stated otherwise.</p>
          <p>You may link to public pages and share case studies with attribution. You may not reproduce substantial portions of the site&apos;s design or copy as your own.</p>
          <p>Project presentations describe work performed. No statement on this site should be read as a guarantee of specific business outcomes.</p>
          <p className="meta text-[11px] tracking-[0.18em] text-[#6E6D6A] uppercase">Last updated — 2026</p>
        </div>
      </Reveal>
    </div>
  );
}
