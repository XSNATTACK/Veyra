"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useRef, useState, type MouseEvent } from "react";
import { HeroShader } from "./hero-shader";
import { ShowreelModal } from "./showreel-modal";
import { HeadlineChip } from "./browser-frame";
import { SplitText } from "./split-text";
import { EASE_SNAP } from "./motion-tokens";

/** Headline line that leans away from the cursor — subtle displacement. */
function ReactiveLine({ text, accentAfter }: { text: string; accentAfter?: string }) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.5 });

  function onMove(e: MouseEvent) {
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.max(Math.hypot(dx, dy), 1);
    const force = Math.min(320 / dist, 1) * 10;
    mx.set((dx / dist) * force);
    my.set((dy / dist) * force);
  }

  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  const words = text.split(" ");
  return (
    <motion.span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={reduce ? undefined : { x: sx, y: sy, display: "inline-block" }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          aria-hidden={false}
          initial={reduce ? false : { y: "115%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 + i * 0.14, ease: EASE_SNAP }}
          style={{ display: "inline-block", overflow: "visible", marginRight: "0.28em" }}
        >
          {w}
        </motion.span>
      ))}
      {accentAfter && (
        <motion.span
          className="serif-accent pr-[0.08em] text-[#FF4D00]"
          initial={reduce ? false : { y: "115%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.55, ease: EASE_SNAP }}
          style={{ display: "inline-block" }}
        >
          {accentAfter}
        </motion.span>
      )}
    </motion.span>
  );
}

export function Hero() {
  const reduce: boolean = false; // studio: motion always on
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress, scrollY } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);
  // scroll-velocity skew — headline leans as you fling (Kota energy)
  const velocity = useVelocity(scrollY);
  const skew = useTransform(velocity, [-3000, 3000], [-4, 4]);
  const skewSmooth = useSpring(skew, { stiffness: 120, damping: 20 });
  const [teaserOpen, setTeaserOpen] = useState(false);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24"
      aria-labelledby="hero-title"
    >
      {/* heavy technical backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* WebGL shader backdrop */}
        <HeroShader className="absolute inset-0 h-full w-full" />

        {/* fading radial grid */}
        <motion.div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            y: gridY,
            backgroundImage:
              "linear-gradient(rgba(244,242,237,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,237,.6) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 20%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 20%, black 30%, transparent 75%)",
          }}
        />

        {/* perspective floor */}
        <div
          className="absolute inset-x-0 bottom-0 h-[42%] overflow-hidden"
          style={{
            maskImage: "linear-gradient(to bottom, transparent, black 45%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 45%)",
            perspective: "520px",
          }}
        >
          <div
            className="floor-grid absolute -inset-x-1/2 bottom-[-30%] left-1/2 h-[160%] w-[200%] opacity-40"
            style={{ transform: "translateX(-50%) rotateX(62deg)", transformOrigin: "center bottom" }}
          />
          {/* horizon line — sovereign glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF4D00]/90 to-transparent blur-[1px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD9B8]/40 to-transparent" />
        </div>

        {/* readability vignette — deeper ceremonial depth */}
        <div className="sovereign-vignette absolute inset-0" />

        {!reduce && (
          <>
            <motion.div
              className="absolute left-1/2 top-24 h-px w-[70%] -translate-x-1/2 bg-[#FF4D00]/60"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: EASE_SNAP, delay: 0.5 }}
            />
            {/* slowly drifting marks */}
            <motion.div
              className="meta absolute right-[6%] top-[18%] hidden text-[11px] tracking-[0.18em] text-[#6E6D6A] lg:block"
              animate={{ y: [0, -14, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              FIG.00 — INTENT
            </motion.div>
            <motion.div
              className="absolute -left-10 top-[46%] h-40 w-40 rounded-full border border-[#F4F2ED]/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#FF4D00]" />
            </motion.div>
            <motion.div
              className="absolute bottom-[8%] right-[10%] hidden h-24 w-24 border border-[#F4F2ED]/10 md:block"
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
      </div>

      <div className="wrap relative">
        <motion.p
          className="eyebrow eyebrow-sovereign flex flex-wrap gap-x-6 gap-y-2"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <span>Independent digital studio</span>
          <motion.span
            className="text-[#FF4D00]"
            animate={reduce ? undefined : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            ●
          </motion.span>
          <span>2026</span>
          <motion.span
            className="text-[#FF4D00]"
            animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            ●
          </motion.span>
          <span>Design / Development / Product</span>
        </motion.p>

        <motion.h1
          id="hero-title"
          style={reduce ? undefined : { y: headY, opacity: headOpacity, skewX: skewSmooth }}
          className="font-display display-1 display-majestic mt-12 font-medium"
        >
          <span
            style={{ display: "block", overflow: "hidden", paddingBottom: "0.09em" }}
            className="whitespace-nowrap"
          >
            <SplitText text="Digital products," delay={0.2} className="inline-block" />
          </span>
          {/* second line breaks the margin — headline chip embedded mid-sentence */}
          <span
            style={{ display: "block", overflow: "hidden", paddingBottom: "0.11em" }}
            className="whitespace-nowrap sm:pl-[0.5em]"
          >
            <motion.span
              style={{ display: "inline-flex", alignItems: "center" }}
              initial={reduce ? false : { y: "115%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.34, ease: EASE_SNAP }}
            >
              Built
              <HeadlineChip label="Live studio visual">
                <span aria-hidden className="chip-drift absolute inset-0" />
                <span aria-hidden className="absolute top-1/2 left-1/2 h-[0.16em] w-[0.16em] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
              </HeadlineChip>
              with
              <span className="mr-[0.28em]" aria-hidden />
            </motion.span>
            <ReactiveLine text="" accentAfter=" intent." />
          </span>
        </motion.h1>

        {/* Kota pill row: availability + play teaser */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: EASE_SNAP }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <span className="meta glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] tracking-[0.2em] uppercase">
            <motion.span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-[#FF4D00] shadow-[0_0_12px_rgba(255,77,0,0.9)]"
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.75, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            Available for new projects
          </span>
            <button
              onClick={() => setTeaserOpen(true)}
              className="group meta glass-pill inline-flex items-center gap-3 rounded-full py-2 pr-5 pl-2 text-[11px] tracking-[0.2em] uppercase transition-colors hover:border-[#FF4D00]"
              aria-haspopup="dialog"
            >
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F2ED] text-black transition-colors group-hover:bg-[#FF4D00] group-hover:text-white">
              <Play size={14} fill="currentColor" aria-hidden />
              <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#FF4D00]/30" />
            </span>
            Play teaser
              <span className="tnum text-[#6E6D6A]">[ 00:12 ]</span>
          </button>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: EASE_SNAP }}
          className="mt-12 grid gap-8 md:grid-cols-12 md:items-end"
        >
          <p className="lede max-w-2xl text-lg md:col-span-6">
            Websites, applications, and products for businesses and founders.
            Direct, deliberate, built to last.
          </p>
          <div className="flex flex-wrap items-center gap-4 md:col-span-6 md:justify-end">
            <Link
              href="/work"
              className="group btn-primary btn-majestic inline-flex items-center gap-2 bg-[#F4F2ED] px-6 py-3.5 text-sm font-semibold tracking-[0.08em] text-black uppercase"
            >
              View selected work
              <ArrowRight size={15} className="cta-arrow" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="u-link inline-flex items-center gap-2 px-2 py-3.5 meta text-xs tracking-[0.18em] uppercase text-[#F4F2ED]"
            >
              Start a project <span className="cta-arrow text-[#FF4D00]" aria-hidden>→</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Kota bottom info bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        style={{ opacity: headOpacity }}
        className="meta absolute inset-x-0 bottom-0 hidden items-center justify-between px-6 pb-6 text-[10px] tracking-[0.22em] text-[#6E6D6A] uppercase sm:flex sm:px-12"
        aria-hidden
      >
        <span>Scroll for more ↓</span>
        <span>Working worldwide</span>
        <span>©2026 — VEYRA®</span>
      </motion.div>

      <ShowreelModal open={teaserOpen} onClose={() => setTeaserOpen(false)} />
    </section>
  );
}
