import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SplitText } from "@/components/split-text";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Studio",
  description: "Small by design. Independent digital studio — working philosophy and process from idea to launch.",
  alternates: { canonical: "/studio" },
};

const steps = [
  { n: "01", t: "Understand", b: "Understand the business, audience, constraints, and actual problem. The cheapest work is the work correctly scoped." },
  { n: "02", t: "Shape", b: "Define structure, experience, visual direction, and product requirements. Decisions made on paper, not in production." },
  { n: "03", t: "Build", b: "Turn the direction into a functioning, responsive product. Working software early, polished continuously." },
  { n: "04", t: "Refine", b: "Remove friction, improve performance, and obsess over details. The last ten percent is the product." },
  { n: "05", t: "Ship", b: "Launch, measure, and continue improving. Releases are routine, rollbacks are painless." },
];

const principles = [
  { t: "Fewer layers", b: "You speak directly with the person designing and building. Nothing lost in handoffs." },
  { t: "Work first", b: "Credibility comes from shipped products and visible quality — not claims, not theatre." },
  { t: "Restraint", b: "Small scope done exceptionally beats large scope done adequately. We say no to protect the yes." },
];

export default function Studio() {
  return (
    <div className="wrap pt-32 sm:pt-44" aria-labelledby="studio-title">
      <Reveal>
        <p className="eyebrow">Studio — Approach</p>
        <h1 id="studio-title" className="font-display display-1 mt-5 font-medium">
          <SplitText text="Small by design." />
        </h1>
        <p className="lede mt-5 max-w-2xl">
          An independent digital studio focused on thoughtful design,
          high-performance development, and digital products. Intentionally small —
          never pretending to be a large agency.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-px overflow-hidden border border-[#F4F2ED]/10 bg-[#F4F2ED]/10 sm:grid-cols-3">
        {principles.map((p, i) => (
          <div key={p.t} className="bg-[#0A0A0B] p-6 sm:p-8">
            <Reveal delay={i * 0.06}>
              <p className="meta text-xs text-[#FF4D00]">0{i + 1}</p>
              <h2 className="font-display mt-3 text-2xl font-semibold">{p.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#A7A5A0]">{p.b}</p>
            </Reveal>
          </div>
        ))}
      </div>

      <Reveal>
        <h2 className="font-display display-3 mt-20 font-semibold">Process.</h2>
      </Reveal>
      <ol className="mt-6">
        {steps.map((s, i) => (
          <li key={s.n}>
            <Reveal delay={i * 0.04}>
              <div className="grid grid-cols-[auto_1fr] gap-5 border-t border-[#F4F2ED]/10 py-7 last:border-b sm:grid-cols-12 sm:gap-8">
                <span className="meta text-xs text-[#FF4D00] sm:col-span-1">{s.n}</span>
                <h3 className="font-display text-2xl font-semibold sm:col-span-4 sm:text-3xl">{s.t}</h3>
                <p className="col-span-2 leading-relaxed text-[#A7A5A0] sm:col-span-7">{s.b}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal>
        <div className="mt-14 border border-[#F4F2ED]/10 bg-[#101013] p-8 sm:p-12">
          <p className="eyebrow">Proof</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-[#D8D6D0]">
            Because the studio stays private, credibility comes from the work
            itself — shipped products, case studies, technical depth, and visible
            quality. No fabricated metrics, no invented clients, no borrowed logos.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/work"
              className="u-link meta inline-flex items-center text-xs tracking-[0.18em] uppercase"
            >
              Judge the work <span className="cta-arrow ml-2 text-[#FF4D00]" aria-hidden>→</span>
            </Link>
            <Link
              href="/contact"
              className="group btn-primary inline-flex items-center gap-2 bg-[#F4F2ED] px-6 py-3.5 text-sm font-semibold tracking-[0.08em] text-black uppercase"
            >
              Start a project
              <ArrowRight size={15} className="cta-arrow" aria-hidden />
            </Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
