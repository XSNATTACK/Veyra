"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const TEXT =
  "You've already built something great. Whether it's taking shape or already scaling — it deserves a website that matches the work you put in.";

function Word({
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
  const opacity = useTransform(progress, [start, end], [0.13, 1]);
  return (
    <motion.span style={{ opacity, display: "inline-block", marginRight: "0.26em" }}>
      {word}
    </motion.span>
  );
}

/**
 * Statement — Kota's second screen. Giant paragraph scrubbed
 * dim→bright word by word as the section travels. Proof folded in.
 */
export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = TEXT.split(" ");

  return (
    <section className="wrap" aria-label="Studio premise">
      <div ref={ref} className="py-28 sm:py-40">
        <p className="eyebrow eyebrow-sovereign">The premise</p>
        <p
          className="font-display mt-8 max-w-6xl text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-medium tracking-tight"
          aria-label={TEXT}
        >
          {words.map((w, i) => (
            <Word key={`${w}-${i}`} word={w} index={i} total={words.length} progress={scrollYProgress} aria-hidden />
          ))}
        </p>
        <p className="meta mt-10 text-[11px] tracking-[0.24em] text-[#6E6D6A] uppercase">
          Trusted by founders — OpenServ · BETTER · LoganCee Studio
        </p>
      </div>
    </section>
  );
}
