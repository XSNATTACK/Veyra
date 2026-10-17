"use client";

import { motion } from "framer-motion";
import { NumberTicker, ScrollReveal } from "./scroll-animations";

const STATS = [
  { value: 100, suffix: "+", label: "Projects shipped", note: "Founders, SaaS, agencies" },
  { value: 3, suffix: "yrs", label: "Independent practice", note: "Design → code, no handoff" },
  { value: 100, suffix: "%", label: "Motion-rich builds", note: "Every page earns its scroll" },
  { value: 2, suffix: "wks", label: "Post-launch support", note: "Fixes included, always" },
];

/**
 * Kota-style stats band — light playful rounded container
 * breaking the dark sovereign flow (hybrid mix).
 */
export function StatsBand() {
  return (
    <section className="wrap mt-28 sm:mt-40" aria-label="Studio in numbers">
      <ScrollReveal y={100} blur={12}>
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
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                }}
                className="group bg-[#F4F2ED] p-6 transition-colors duration-300 hover:bg-[#0A0A0B] hover:text-[#F4F2ED] sm:p-8"
              >
                <p className="font-display tnum text-5xl font-extrabold tracking-tight sm:text-6xl">
                  <NumberTicker value={s.value} suffix={s.suffix} />
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
