"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { EASE_SNAP_FN } from "./motion-tokens";

const TEXT =
  "You've already built something great. Whether it's taking shape or already scaling — it deserves a website that matches the work you put in.";

/* Pinned hold block — arrives after the scrub rests, services-pin style. */
const HOLD_LABEL = "The standard";
const HOLD_STATEMENT = "Direct, deliberate, built to last.";
const HOLD_TRUST = "Trusted by founders — OpenServ · BETTER · LoganCee Studio";

/* Choreography map (progress across the 220vh pin travel):
   0 → 0.55   word scrub dim → bright (completes well before the pin ends)
   0.55 → 0.6 rest beat — text fully bright, holds
   0.6 → 0.78 scrub composition dissolves out
   0.66 → 0.86 hold block rises in
   0.86 → 1   held, then the section releases
*/
const SCRUB_SPAN = 0.55;
const OUT_RANGE: [number, number] = [0.6, 0.78];
const IN_RANGE: [number, number] = [0.66, 0.86];

/* framer-motion v13 binds scroll-linked MotionValues to native CSS
   scroll-driven WAAPI animations (ViewTimeline) whenever the browser supports
   them. Two hard bugs surface in that path:
   1. Keyframe offsets are the raw inputRange, and a final offset below 1.0
      makes Web Animations synthesize an implicit terminal keyframe from the
      element's current style — decaying every value back to its initial state
      for the remainder of the pin (the overlapping-text bug). Every range
      therefore ends explicitly at 1.0 holding its resting value.
   2. Even with terminal keyframes, an easing function passed to the chain
      corrupts the animation's reported timeline phase (values render at the
      wrong point of the pin). Routing each value through an intermediate
      MotionValue (useJsTransform) strips the "accelerate" flag, so the value
      falls back to framer's JS pipeline: same math, inline style writes, no
      WAAPI — identical behavior across browsers. */
const OUT_TAIL: [number, number, number] = [...OUT_RANGE, 1];
const IN_TAIL: [number, number, number] = [...IN_RANGE, 1];

function useJsTransform<T extends number | string>(
  input: MotionValue<number>,
  inputRange: readonly number[],
  outputRange: readonly T[],
  ease?: (t: number) => number,
): MotionValue<T> {
  /* A chained transform never re-accelerates: the stage value soaks up the
     accelerate flag while never being style-bound, so no WAAPI animation is
     ever created and the consumer stays on the JS path. */
  const stage = useTransform(input, [...inputRange], [...outputRange], ease ? { ease } : undefined);
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
  /* Words finish revealing by SCRUB_SPAN — the reveal leads the scroll instead of trailing it. */
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
 * Statement — pinned scroll experience: a word-by-word reveal that completes
 * early in the pin, a short rest beat, then a crossfade into a held statement
 * block, mirroring the "Our Services" pin pattern.
 */
export function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const words = TEXT.split(" ");

  const scrubOpacity = useJsTransform(scrollYProgress, OUT_TAIL, [1, 0.06, 0.06], EASE_SNAP_FN);
  const scrubY = useJsTransform(scrollYProgress, OUT_TAIL, [0, -28, -28], EASE_SNAP_FN);
  const scrubScale = useJsTransform(scrollYProgress, OUT_TAIL, [1, 0.94, 0.94], EASE_SNAP_FN);
  const scrubBlur = useJsTransform(scrollYProgress, OUT_TAIL, ["blur(0px)", "blur(5px)", "blur(5px)"], EASE_SNAP_FN);

  const holdOpacity = useJsTransform(scrollYProgress, IN_TAIL, [0, 1, 1], EASE_SNAP_FN);
  const holdY = useJsTransform(scrollYProgress, IN_TAIL, [48, 0, 0], EASE_SNAP_FN);
  const holdBlur = useJsTransform(scrollYProgress, IN_TAIL, ["blur(10px)", "blur(0px)", "blur(0px)"], EASE_SNAP_FN);

  return (
    <section ref={ref} className="relative h-[220vh]" aria-label="Studio premise">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="wrap relative w-full">
          {/* scrub layer */}
          <motion.div style={{ opacity: scrubOpacity, y: scrubY, scale: scrubScale, filter: scrubBlur }}>
            <p className="eyebrow eyebrow-sovereign">The premise</p>
            <p
              className="font-display mt-8 max-w-6xl text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-medium tracking-tight"
              aria-label={TEXT}
            >
              {words.map((w, i) => (
                <Word key={`${w}-${i}`} word={w} index={i} total={words.length} progress={scrollYProgress} />
              ))}
            </p>
          </motion.div>

          {/* hold layer — pinned label + statement, services-pin style */}
          <motion.div
            style={{ opacity: holdOpacity, y: holdY, filter: holdBlur }}
            className="pointer-events-none absolute inset-0 flex flex-col justify-center px-5 md:px-12"
          >
            <p className="meta text-[11px] tracking-[0.24em] text-[#6E6D6A] uppercase">{HOLD_LABEL}</p>
            <p className="font-display mt-5 max-w-6xl text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] font-medium tracking-tight">
              {HOLD_STATEMENT}
            </p>
            <p className="meta mt-10 text-[11px] tracking-[0.24em] text-[#6E6D6A] uppercase">{HOLD_TRUST}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
