import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CapabilityAccordion, Manifest } from "@/components/capabilities";
import { SplitText } from "@/components/split-text";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Services",
  description: "Business websites, web applications, and digital products — stated plainly.",
  alternates: { canonical: "/services" },
};

export default function Services() {
  return (
    <div className="wrap pt-32 sm:pt-44" aria-labelledby="services-title">
      <Reveal>
        <p className="eyebrow">Services — Capabilities</p>
        <h1 id="services-title" className="font-display display-1 mt-5 font-medium">
          <SplitText text="What we build." />
        </h1>
        <p className="lede mt-5 max-w-2xl">
          The offering is deliberately narrow. Three things, done properly — no
          brochure language, no claimed services that cannot be delivered.
        </p>
      </Reveal>
      <div className="mt-12">
        <CapabilityAccordion />
      </div>
      <Reveal>
        <h2 className="font-display display-3 mt-20 font-semibold">Capability manifest.</h2>
        <p className="mt-3 max-w-2xl text-[#A7A5A0]">
          The working stack. Everything listed is in active use — nothing aspirational.
        </p>
      </Reveal>
      <div className="mt-8">
        <Manifest />
      </div>
      <Reveal>
        <div className="mt-14 border-t border-[#F4F2ED]/10 py-10">
          <Link
            href="/contact"
            className="group btn-primary inline-flex items-center gap-2 bg-[#F4F2ED] px-7 py-4 text-sm font-semibold tracking-[0.08em] text-black uppercase"
          >
            Discuss your project
            <ArrowRight size={15} className="cta-arrow" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
