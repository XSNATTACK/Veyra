"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const QUOTES = [
  {
    text: "Thrilled with how the final website turned out — just as I envisioned it. Communication was top-notch throughout, extremely professional. 10/10 would recommend!",
    name: "Tim Hafner",
    role: "OpenServ",
  },
  {
    text: "Wonderful animations, themes and font selections. From the partitioning to the images chosen — everything shows expertise.",
    name: "Aryaman Chhaya",
    role: "BETTER",
  },
  {
    text: "Really professional, dedicated and thoughtful. Meticulous, with 100% passion in every product created.",
    name: "LoganCee",
    role: "LoganCee Studio",
  },
];

function ScrubWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const color = useTransform(progress, [start, end], ["rgba(10,10,11,0.13)", "rgba(10,10,11,1)"]);
  return (
    <motion.span style={{ color, display: "inline-block", marginRight: "0.26em" }}>
      {word}
    </motion.span>
  );
}

/**
 * Kota-style giant testimonial scrub — full-bleed light section,
 * display-size quote revealed word by word on scroll, switchable.
 */
export function Testimonials() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const [idx, setIdx] = useState(0);
  const q = QUOTES[idx];
  const words = q.text.split(" ");

  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + QUOTES.length) % QUOTES.length);

  return (
    <section ref={ref} className="relative mt-28 bg-[#F4F2ED] text-[#0A0A0B] sm:mt-40" aria-labelledby="love-title">
      <div className="lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:flex-col lg:justify-center">
      <div className="wrap py-24 sm:py-32">
        <div className="flex items-baseline justify-between gap-6">
          <p className="meta text-[11px] tracking-[0.24em] text-black/50 uppercase">Testimonial</p>
          <p className="meta tnum text-[11px] tracking-[0.2em] text-black/50">
            0{idx + 1} / 0{QUOTES.length}
          </p>
        </div>
        <h2 id="love-title" className="sr-only">Client testimonials</h2>
        <blockquote key={idx} className="font-display mt-8 text-[clamp(1.9rem,5.2vw,4.75rem)] leading-[1.04] font-medium tracking-tight">
          <span aria-hidden>“</span>
          {words.map((w, i) => (
            <ScrubWord key={`${idx}-${i}`} word={w} index={i} total={words.length} progress={scrollYProgress} />
          ))}
          <span aria-hidden>”</span>
          <span className="sr-only">{q.text}</span>
        </blockquote>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
          <p className="meta text-sm tracking-[0.06em]">
            — {q.name}, <span className="text-black/55">{q.role}</span>
          </p>
          <div className="flex items-center gap-3">
            <div className="mr-2 hidden gap-2 sm:flex" aria-hidden>
              {QUOTES.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-8 bg-[#FF4D00]" : "w-3 bg-black/15"}`} />
              ))}
            </div>
            <button onClick={() => go(-1)} aria-label="Previous testimonial" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/15 transition-colors hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white">
              <ArrowLeft size={18} aria-hidden />
            </button>
            <button onClick={() => go(1)} aria-label="Next testimonial" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/15 transition-colors hover:border-[#FF4D00] hover:bg-[#FF4D00] hover:text-white">
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      </div>
      </div>
      {/* pin travel spacer (desktop) */}
      <div className="hidden lg:block lg:h-[55vh]" aria-hidden />
    </section>
  );
}
