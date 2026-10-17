"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { EASE_SNAP } from "./motion-tokens";
import { SplitText } from "./split-text";
import { ScrollReveal } from "./scroll-animations";

const FAQS = [
  {
    q: "Who is this for?",
    a: "Founders, SaaS teams, and businesses who need a site that looks like a $10k build without the $10k timeline. If you need something live in weeks, not months, you're in the right place.",
  },
  {
    q: "What do you actually help with?",
    a: "Four things: business websites that convert, web applications with complex workflows, digital products from concept to production, and AI-enabled experiences where AI creates genuine utility. Pick one, or all four.",
  },
  {
    q: "Are you a designer, or do you also build?",
    a: "Both. Design and build happen here — no handoff, no waiting on a separate developer to translate the Figma file. What you approve is what ships.",
  },
  {
    q: "How fast can we start?",
    a: "Usually right away. The practice stays small by design so turnaround is fast — tell us your deadline and we'll confirm what's realistic before anything is signed.",
  },
  {
    q: "What happens after launch?",
    a: "Every project includes 2 weeks of post-launch support for fixes. Need anything beyond that? We scope and price it separately — no retainer trap.",
  },
];

/** Kota-style FAQ — "Question before you decide." */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="wrap mt-28 sm:mt-40" aria-labelledby="faq-title">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ScrollReveal y={60} blur={8}>
            <p className="eyebrow eyebrow-sovereign">FAQ</p>
            <h2 id="faq-title" className="font-display display-2 mt-6 font-medium">
              <SplitText text="Question before you decide." />
            </h2>
            <a
              href="mailto:xsnckp@gmail.com"
              className="u-link meta mt-6 inline-block text-xs tracking-[0.18em] uppercase"
            >
              Ask a question <span className="text-[#FF4D00]">→</span>
            </a>
          </ScrollReveal>
        </div>
        <div className="lg:col-span-8">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <ScrollReveal key={f.q} y={40} blur={6} delay={i * 0.05}>
                <div className="border-t border-[#F4F2ED]/10 last:border-b">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="grid w-full grid-cols-[1fr_auto] items-center gap-4 py-6 text-left"
                  >
                    <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                      <span className="meta mr-3 align-middle text-xs text-[#FF4D00]">
                        0{i + 1}
                      </span>
                      {f.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: EASE_SNAP }}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                        isOpen
                          ? "border-[#FF4D00] bg-[#FF4D00] text-white"
                          : "border-[#F4F2ED]/20"
                      }`}
                    >
                      <Plus size={17} aria-hidden />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE_SNAP }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 leading-relaxed text-[#A7A5A0]">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
