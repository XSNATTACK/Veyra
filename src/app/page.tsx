import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { BlackHole, StarsBackdrop } from "@/components/black-hole";
import { Manifest } from "@/components/capabilities";
import { ServiceShowcase } from "@/components/service-showcase";
import { WorkShowcase } from "@/components/work-showcase";
import { StatsBand } from "@/components/stats-band";
import { Statement } from "@/components/statement";
import { Testimonials } from "@/components/testimonials";
import { Faq } from "@/components/faq";
import { faqs } from "@/content/faqs";
import { Marquee } from "@/components/motion";
import { SplitText } from "@/components/split-text";
import { StackSection } from "@/components/stack-section";
import { CtaZoom } from "@/components/cta-zoom";
import {
  ScrollReveal,
  SplitReveal,
  TextScrub,
  HorizontalSlide,
  ScrollParallaxLayer,
} from "@/components/scroll-animations";

export const metadata: Metadata = {
  // Self-referencing canonical — every other route sets its own.
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />

      {/* 02 — Statement scrub */}
      <Statement />

      {/* 03 — Stats */}
      <StatsBand />

      {/* 04 — Services (own pin inside; not stacked to preserve pin travel) */}
      <div>
        <section className="mt-28 bg-[#0A0A0B] sm:mt-40" aria-labelledby="services-title">
          <div className="wrap">
            <SplitReveal stagger={0.16}>
              <div>
                <p className="eyebrow eyebrow-sovereign">Capabilities</p>
                <h2 id="services-title" className="font-display display-2 mt-6 max-w-3xl font-medium">
                  <SplitText text="What we build." />
                </h2>
              </div>
              <div>
                <TextScrub
                  text="Scroll through three ways to work together — the visual holds while the specs change."
                  className="lede mt-5 max-w-2xl"
                />
              </div>
            </SplitReveal>
          </div>
          <div className="mt-10">
            <ServiceShowcase />
          </div>
          <div className="wrap">
            <HorizontalSlide from="left" distance={100}>
              <div className="mt-12">
                <Manifest />
              </div>
            </HorizontalSlide>
          </div>
        </section>
      </div>

      {/* 05 — Work showcase (pinned showpiece) */}
      <WorkShowcase />

      {/* 06 — Testimonials */}
      <Testimonials />

      {/* 07 — FAQ */}
      <StackSection z={2}>
        <div className="bg-[#0A0A0B]">
          <Faq />
        </div>
      </StackSection>

      {/* 08 — Final CTA */}
      <StackSection z={3}>
        <section className="relative mt-28 overflow-hidden border-t border-[#F4F2ED]/10 bg-[#0C0C0E] sm:mt-40" aria-labelledby="cta-title">
          <div className="border-b border-[#F4F2ED]/10 py-5" aria-hidden>
            <Marquee speed={32}>
              <div className="marquee-track">
                {[0, 1].map((copy) => (
                  <span key={copy} className="font-display inline-flex items-baseline text-2xl font-semibold tracking-tight whitespace-nowrap sm:text-3xl">
                    <span className="px-6">Let&apos;s get started</span>
                    <span className="text-[#FF4D00]" aria-hidden>●</span>
                    <span className="text-outline px-6" aria-hidden>Have something worth building</span>
                    <span className="text-[#FF4D00]" aria-hidden>●</span>
                  </span>
                ))}
              </div>
            </Marquee>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full opacity-30 blur-[140px]"
            style={{ background: "#FF4D00" }}
          />
          <ScrollParallaxLayer speed={0.15} direction="down">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full opacity-[0.22] blur-[120px]"
              style={{ background: "#FF4D00" }}
            />
          </ScrollParallaxLayer>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <StarsBackdrop className="absolute inset-0 h-full w-full" />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[68%]">
            <CtaZoom className="absolute aspect-square h-[125%] opacity-95 right-[-32%] top-auto bottom-[-38%] translate-y-0 sm:h-[170%] sm:opacity-100 sm:right-[-14%] sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2">
              <div
                className="absolute inset-0"
                style={{
                  maskImage: "radial-gradient(closest-side, black 45%, transparent 82%)",
                  WebkitMaskImage: "radial-gradient(closest-side, black 45%, transparent 82%)",
                }}
              >
                <BlackHole className="absolute inset-0 h-full w-full" />
              </div>
            </CtaZoom>
          </div>
          <div className="wrap relative py-28 sm:py-40">
            <ScrollReveal y={140} blur={18} scale={0.9}>
              <p className="eyebrow eyebrow-sovereign">Availability — selective</p>
              <h2 id="cta-title" className="font-display display-1 display-majestic mt-7 max-w-6xl font-medium">
                <SplitText text="Have something" />
                <br />
                <span className="serif-accent">worth building?</span>
              </h2>
              <TextScrub
                text="Tell us what you're working on, where you're trying to go, and what needs to be built."
                className="lede mt-7 max-w-xl text-lg [text-shadow:0_1px_14px_rgba(0,0,0,0.95),0_0_4px_rgba(0,0,0,0.9)]"
              />
              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  href="/contact"
                  className="group btn-primary btn-majestic inline-flex items-center gap-2 bg-[#F4F2ED] px-7 py-4 text-sm font-semibold tracking-[0.08em] text-black uppercase"
                >
                  Start a project
                  <ArrowRight size={15} className="cta-arrow" aria-hidden />
                </Link>
                <Link href="/work" className="u-link meta inline-flex items-center px-2 py-4 text-xs tracking-[0.18em] uppercase">
                  Review the work first <span className="cta-arrow ml-2 text-[#FF4D00]" aria-hidden>→</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </StackSection>

      {/* FAQPage structured data — mirrors the on-page FAQ accordion */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </>
  );
}
