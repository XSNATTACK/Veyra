"use client";

import { motion } from "framer-motion";
import { NumberTicker, ScrollReveal } from "./scroll-animations";

type Stat =
  | { value: number; suffix: string; text?: never; label: string; note: string }
  | { text: string; value?: never; suffix?: never; label: string; note: string };

const STATS: Stat[] = [
  { value: 100, suffix: "+", label: "Projects shipped", note: "Founders, SaaS, agencies" },
  { value: 3, suffix: "yrs", label: "Independent practice", note: "Design → code, no handoff" },
  { value: 100, suffix: "%", label: "Motion-rich builds", note: "Every page earns its scroll" },
  { text: "Lifetime", label: "Post-launch support", note: "Fixes included, always" },
];

/**
 * Kota-style stats band — light playful rounded container
 * breaking the dark sovereign flow (hybrid mix).
 */
export function StatsBand() {
  return (
    <section className="wrap mt-6 sm:mt-10" aria-label="Studio in numbers">
      <ScrollReveal y={0} blur={0} duration={0.05}>
        <div className="overflow-hidden rounded-[2rem] bg-[#F4F2ED] p-8 text-[#0A0A0B] sm:rounded-[2.5rem] sm:p-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="meta text-[11px] tracking-[0.24em] text-[#0A0A0B]/60 uppercase">
                ● Studio in numbers
              </p>
              <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
                Built like a <span className="serif-accent text-[#FF4D00]">product</span>, not a page.
              </h2>
            </div>
            <p className="meta max-w-xs text-xs leading-relaxed tracking-[0.08em] text-[#0A0A0B]/60 uppercase">
              Fixed scope. Fast turnaround. Motion included, never decoration.
            </p>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-[#0A0A0B]/10 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 0, scale: 1 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{
                  duration: 0.1,
                  delay: i * 0.01,
                  type: "spring",
                  stiffness: 1000,
                  damping: 30,
                }}
                className="group bg-[#F4F2ED] p-6 transition-colors duration-300 hover:bg-[#0A0A0B] hover:text-[#F4F2ED] sm:p-8"
              >
                <p className="font-display tnum text-5xl font-extrabold tracking-tight sm:text-6xl">
                  {s.text !== undefined ? (
                    s.text
                  ) : (
                    <NumberTicker value={s.value} suffix={s.suffix} />
                  )}
                </p>
                <p className="font-display mt-3 text-lg font-bold">{s.label}</p>
                <p className="meta mt-1 text-[11px] tracking-[0.14em] text-current uppercase opacity-60">
                  {s.note}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
