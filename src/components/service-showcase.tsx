"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { DisplacementSurface } from "./displacement-visual";
import { PlumbingPreview, TradionPreview } from "./service-visuals";
import { SplitText } from "./split-text";
import { scrollToEl } from "./smooth-scroll";
import type { Project } from "@/content/projects";

const SERVICES: {
  title: string;
  blurb: string;
  timeline: string;
  deliverables: string;
  price: string;
  motif: Project["motif"];
  url: string;
}[] = [
  {
    title: "Business Websites",
    blurb:
      "A single sharp website built to earn its traffic. Message-first structure, editorial type, and a conversion path that stays visible without shouting.",
    timeline: "1–2 weeks",
    deliverables: "Full website",
    price: "50$ (negotiable)",
    motif: "grid",
    url: "banyulancar.web.id",
  },
  {
    title: "Web Applications",
    blurb:
      "Complex workflows rebuilt as clean, intuitive interfaces. State-aware views, role-scoped surfaces, and empty states designed — never defaulted.",
    timeline: "2–4 weeks",
    deliverables: "App + API wiring",
    price: "450$ (negotiable)",
    motif: "ledger",
    url: "tradionapp.com",
  },
  {
    title: "Digital Products",
    blurb:
      "From concept and interface through production. Smallest testable core loop first, tokens earned from real screens, iteration kept cheap.",
    timeline: "3–6 weeks",
    deliverables: "Product + system",
    price: "scoped",
    motif: "field",
    url: "bdacapital.vercel.app/",
  },
];

/**
 * Scroll-driven service showcase — full-bleed light section.
 * The browser visual pins while spec sheets scroll through;
 * scroll position drives the active service AND the WebGL morph.
 * Tab pills remain as scroll-shortcut anchors.
 */
export function ServiceShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(SERVICES.length - 1, Math.floor(v * SERVICES.length)));
  });

  const jump = (i: number) => {
    const el = document.getElementById(`svc-${i}`);
    if (el) scrollToEl(el, -120);
  };

  return (
    <section ref={ref} className="relative bg-[#F4F2ED] text-[#0A0A0B]" aria-label="Services">
      <div className="wrap grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* pinned visual */}
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-16">
          <p className="meta text-[11px] tracking-[0.24em] text-black/50 uppercase">Our Services</p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_32px_80px_-32px_rgba(0,0,0,0.4)] sm:rounded-3xl">
            <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3" aria-hidden="true">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </span>
              <span className="meta mx-auto max-w-[60%] truncate rounded-full bg-black/5 px-4 py-1 text-[10px] tracking-[0.08em] text-black/50">
                {SERVICES[active].url}
              </span>
              <span className="w-10 shrink-0 text-black/30">···</span>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0D0D10]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full"
                >
                  {active === 0 ? (
                    <PlumbingPreview />
                  ) : active === 1 ? (
                    <TradionPreview />
                  ) : (
                    <DisplacementSurface
                      from={SERVICES[0].motif}
                      to={SERVICES[SERVICES.length - 1].motif}
                      progress={scrollYProgress}
                      className="absolute inset-0 h-full w-full"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {active === 2 && (
                <div aria-hidden className="absolute left-[4%] right-[4%] top-[6%] flex justify-between meta text-[11px] tracking-[0.2em] text-[#A7A5A0]">
                  <span>FIG. 03</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF4D00]" />
                    {SERVICES[active].title.toUpperCase()} / LIVE
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Services">
            {SERVICES.map((t, i) => (
              <button
                key={t.title}
                role="tab"
                aria-selected={active === i}
                onClick={() => jump(i)}
                className={`meta rounded-full px-4 py-2 text-[11px] tracking-[0.14em] uppercase transition-all duration-300 ${
                  active === i ? "bg-[#0A0A0B] text-white" : "bg-black/5 text-black/55 hover:bg-black/10 hover:text-black"
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* scrolling spec sheets */}
        <div>
          {SERVICES.map((s, i) => {
            const on = active === i;
            return (
              <div key={s.title} id={`svc-${i}`} className="flex min-h-[70vh] scroll-mt-32 flex-col justify-center py-14 lg:min-h-[92vh]">
                <motion.div animate={{ opacity: on ? 1 : 0.35, y: on ? 0 : 24 }} transition={{ duration: 0.5 }}>
                  <p className="meta tnum text-xs tracking-[0.2em] text-[#FF4D00]">0{i + 1} / 03</p>
                  <h3 className="font-display mt-3 text-5xl leading-[0.95] font-medium tracking-tight sm:text-6xl">
                    {on ? <SplitText key={s.title} text={s.title} /> : s.title}
                  </h3>
                  <p className="mt-5 max-w-md leading-relaxed text-black/65">{s.blurb}</p>
                  <dl className="mt-7 border-t border-black/10">
                    {[
                      ["Timeline", s.timeline],
                      ["Deliverables", s.deliverables],
                      ["Starting from", s.price],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[130px_1fr] items-baseline gap-4 border-b border-black/10 py-3.5">
                        <dt className="meta text-[11px] tracking-[0.18em] text-black/45 uppercase">{k}</dt>
                        <dd className={`font-display font-semibold ${k === "Starting from" ? "tnum text-3xl font-medium" : "text-xl"}`}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href="/contact"
                    className="group meta mt-7 inline-flex items-center gap-2 rounded-full bg-[#0A0A0B] px-6 py-3 text-[11px] font-bold tracking-[0.16em] text-white uppercase transition-colors duration-300 hover:bg-[#FF4D00]"
                  >
                    Start a project
                    <ArrowUpRight size={14} aria-hidden className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
