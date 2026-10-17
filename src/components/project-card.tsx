"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import type { Project } from "@/content/projects";
import { ProjectShot } from "./service-visuals";
import { CountUp } from "./motion";
import { ClipReveal, Reveal } from "./reveal";
import { BrowserFrame } from "./browser-frame";
import { EASE_SNAP } from "./motion-tokens";

export function ProjectCard({ project, flip = false }: { project: Project; flip?: boolean }) {
  const reduce: boolean = false; // studio: motion always on
  const visualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: visualRef, offset: ["start end", "end start"] });
  const innerY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const numX = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <article className="rule-majestic group/card py-14 sm:py-20" aria-labelledby={`project-${project.slug}`}>
      <Reveal x={flip ? 72 : -72} y={64}>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <span className="font-display tnum text-sm font-bold text-[#FF4D00]">
            <CountUp to={parseInt(project.index, 10)} />
          </span>
          <div className="overflow-hidden">
            <motion.h3
              id={`project-${project.slug}`}
              className="font-display display-2 font-bold tracking-tight transition-colors duration-300 group-hover/card:text-white"
              initial={reduce ? false : { y: "60%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, ease: EASE_SNAP }}
            >
              <Link href={`/work/${project.slug}`}>{project.title}</Link>
            </motion.h3>
          </div>
          {/* sliding accent rule grows on scroll into view */}
          <motion.span
            aria-hidden
            className="h-[3px] origin-left bg-gradient-to-r from-[#FF4D00] to-[#FF8A3D] shadow-[0_0_16px_rgba(255,77,0,0.6)]"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: EASE_SNAP }}
            style={{ width: "100%" }}
          />
        </div>
        <div className={`mt-6 grid gap-8 lg:grid-cols-12 ${flip ? "lg:[&>*:first-child]:order-2" : ""}`}>
          <div className="lg:col-span-4">
            <p className="max-w-sm leading-relaxed text-[#A7A5A0]">{project.summary}</p>
            <dl className="meta mt-6 space-y-2 text-[11px] tracking-[0.16em] uppercase">
              <div className="flex gap-3"><dt className="w-20 text-[#6E6D6A]">Category</dt><dd>{project.category}</dd></div>
              <div className="flex gap-3"><dt className="w-20 text-[#6E6D6A]">Year</dt><dd>{project.year}</dd></div>
              <div className="flex gap-3"><dt className="w-20 text-[#6E6D6A]">Role</dt><dd>{project.role}</dd></div>
            </dl>
            <Link
              href={`/work/${project.slug}`}
              className="group meta mt-8 inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase"
              aria-label={`View ${project.title} case study`}
            >
              <span className="u-link">View project</span>
              <ArrowUpRight size={15} className="cta-arrow text-[#FF4D00]" aria-hidden />
            </Link>
          </div>
          <div className="relative lg:col-span-8">
            {/* drifting index numeral behind visual */}
            {!reduce && (
              <motion.span
                aria-hidden
                style={{ x: numX }}
                className="font-display pointer-events-none absolute -top-14 right-0 z-10 select-none text-8xl font-bold text-[#F4F2ED]/10 sm:text-9xl"
              >
                {project.index}
              </motion.span>
            )}
            <ClipReveal>
              <Link
                href={`/work/${project.slug}`}
                className="frame frame-majestic shine group/visual relative block overflow-hidden rounded-3xl"

                aria-label={`${project.title} case study`}
              >
                <BrowserFrame url={project.liveUrl ?? `veyra.studio/work/${project.slug}`}>
                  <div ref={visualRef} style={{ overflow: "hidden" }}>
                    <motion.div style={reduce ? undefined : { y: innerY, scale: 1.22 }}>
                      <ProjectShot project={project} />
                    </motion.div>
                  </div>
                </BrowserFrame>
                {/* Kota-style floating tags */}
                <span className="meta absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] tracking-[0.16em] text-[#F4F2ED] uppercase backdrop-blur">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF4D00]" aria-hidden />
                  {project.category}
                </span>
                <span className="meta tnum absolute top-4 right-4 rounded-full bg-[#F4F2ED] px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-black uppercase">
                  {project.year}
                </span>
                <span className="meta absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#FF4D00] px-4 py-2 text-[10px] font-bold tracking-[0.18em] text-white uppercase">
                  View case <ArrowUpRight size={13} aria-hidden />
                </span>
              </Link>
            </ClipReveal>
            <p className="meta mt-3 flex justify-between text-[11px] tracking-[0.18em] text-[#6E6D6A] uppercase">
              <span>{project.services.slice(0, 3).join(" / ")}</span>
              <span className="hidden transition-colors group-hover/card:text-[#FF4D00] sm:inline">View project ↗</span>
            </p>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
