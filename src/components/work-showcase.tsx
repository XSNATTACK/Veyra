"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/content/projects";
import { ProjectShot } from "./service-visuals";
import { SplitText } from "./split-text";
import { site } from "@/config/site";

/** Host used for the URL pill when a project has no live URL yet. */
const SITE_HOST = site.url.replace(/^https?:\/\//, "");

/**
 * Pinned work showcase — the showpiece. The browser visual sticks
 * for ~4 screens while project rows scroll through; scroll position
 * drives the active project, the WebGL morph, the counter and rail.
 */
export function WorkShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const railX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(projects.length - 1, Math.floor(v * projects.length)));
  });

  const p = projects[active];

  return (
    <section ref={ref} className="relative bg-[#0A0A0B]" aria-labelledby="work-title">
      <div className="wrap grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* pinned visual */}
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-14">
          <p className="eyebrow eyebrow-sovereign">Selected work — 2024 / 2026</p>
          <h2 id="work-title" className="font-display display-2 mt-5 font-medium">
            <SplitText text="The work speaks first." />
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[#F4F2ED]/15 bg-[#0D0D10] sm:rounded-3xl">
            <div className="flex items-center gap-3 border-b border-[#F4F2ED]/10 px-4 py-3" aria-hidden="true">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </span>
              <span className="meta mx-auto max-w-[60%] truncate rounded-full bg-[#F4F2ED]/8 px-4 py-1 text-[10px] tracking-[0.08em] text-[#A7A5A0]">
                {p.liveUrl ?? `${SITE_HOST}/work/${p.slug}`}
              </span>
              <span className="tnum w-10 shrink-0 text-right text-[11px] text-[#FF4D00]">
                0{active + 1}/0{projects.length}
              </span>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={p.slug}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="absolute inset-0 h-full w-full"
                >
                  <ProjectShot project={p} />
                </motion.div>
              </AnimatePresence>
              {!(p.visualKind === "image" && p.heroImage) && (
                <>
                  <div
                    aria-hidden
                    className="font-display pointer-events-none absolute -right-2 -bottom-8 select-none text-[8rem] leading-none font-semibold text-[#F4F2ED]/[0.09]"
                  >
                    {p.index}
                  </div>
                  <div aria-hidden className="absolute left-[4%] right-[4%] top-[6%] flex justify-between meta text-[11px] tracking-[0.2em] text-[#A7A5A0]">
                    <span>FIG. {p.index}</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF4D00]" />
                      {p.category.toUpperCase()} / LIVE
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* progress rail */}
          <div className="mt-5 h-[2px] overflow-hidden rounded bg-[#F4F2ED]/10" aria-hidden>
            <motion.div className="h-full origin-left bg-gradient-to-r from-[#FF4D00] to-[#FF8A3D]" style={{ scaleX: railX }} />
          </div>
          <Link href="/work" className="group meta mt-5 inline-flex w-fit items-center gap-2 text-xs tracking-[0.18em] uppercase">
            <span className="u-link">Full index</span>
            <ArrowUpRight size={15} className="cta-arrow text-[#FF4D00]" aria-hidden />
          </Link>
        </div>

        {/* scrolling rows */}
        <div>
          {projects.map((proj, i) => {
            const on = active === i;
            return (
              <div key={proj.slug} id={`work-${proj.slug}`} className="flex min-h-[62vh] scroll-mt-32 flex-col justify-center py-12 lg:min-h-[88vh]">
                <motion.div animate={{ opacity: on ? 1 : 0.3, y: on ? 0 : 28 }} transition={{ duration: 0.5 }}>
                  <p className="font-display tnum text-sm font-bold text-[#FF4D00]">№ {proj.index}</p>
                  <h3 className="font-display mt-3 text-5xl font-medium tracking-tight sm:text-6xl">
                    <Link href={`/work/${proj.slug}`}>{proj.title}</Link>
                  </h3>
                  <p className="mt-4 max-w-md leading-relaxed text-[#A7A5A0]">{proj.summary}</p>
                  <dl className="meta mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[11px] tracking-[0.16em] text-[#6E6D6A] uppercase">
                    <span>{proj.category}</span>
                    <span>{proj.year}</span>
                    <span>{proj.role}</span>
                  </dl>
                  <Link
                    href={`/work/${proj.slug}`}
                    data-cursor="VIEW ↗"
                    className="group meta mt-6 inline-flex items-center gap-2 rounded-full border border-[#F4F2ED]/20 px-5 py-2.5 text-[11px] tracking-[0.18em] uppercase transition-colors hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white"
                    aria-label={`View ${proj.title} case study`}
                  >
                    View project
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
