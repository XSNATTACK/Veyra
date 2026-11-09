"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const TEXT =
  "You've already built something great. Whether it's taking shape or already scaling — it deserves a website that matches the work you put in.";

/* Words finish revealing by SCRUB_SPAN of the pin travel, then hold bright. */
const SCRUB_SPAN = 0.55;

function useJsTransform<T extends number | string>(
  input: MotionValue<number>,
  inputRange: readonly number[],
  outputRange: readonly T[],
): MotionValue<T> {
  const stage = useTransform(input, [...inputRange], [...outputRange]);
  return useTransform(stage, (v) => v);
}

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
  const start = (index / total) * SCRUB_SPAN;
  const end = start + SCRUB_SPAN / total;
  const opacity = useJsTransform(progress, [start, end, 1], [0.13, 1, 1]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, display: "inline-block", marginRight: "0.26em" }}
    >
      {word}
    </motion.span>
  );
}

/**
 * Statement — pinned scroll experience: word-by-word reveal that completes
 * at mid-pin and stays fully bright through the rest of the scroll.
 */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = TEXT.split(" ");

  return (
    <section ref={ref} className="relative h-[140vh]" aria-label="Studio premise">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="wrap relative w-full">
          <div>
            <p className="eyebrow eyebrow-sovereign">The premise</p>
            <p
              className="font-display mt-8 max-w-6xl text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-medium tracking-tight"
              aria-label={TEXT}
            >
              {words.map((w, i) => (
                <Word key={`${w}-${i}`} word={w} index={i} total={words.length} progress={scrollYProgress} />
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
