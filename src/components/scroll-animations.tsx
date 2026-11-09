"use client";

import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_SNAP } from "./motion-tokens";

/* ═══════════════════════════════════════════════════════════════════════════
   HEAVY SCROLL ANIMATIONS
   Drop-in components that add dramatic, scroll-driven motion to sections.
   Studio decision: motion is always on (reduced-motion preference ignored).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ---------- ScrollReveal: STATIC (fade-in removed 2026-11-09) ---------- */

export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  blur?: number;
  rotate?: number;
  duration?: number;
}) {
  return <div className={className}>{children}</div>;
}

/* ---------- SplitReveal: STATIC (fade-in removed 2026-11-09) ----------- */

export function SplitReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  direction?: "up" | "left" | "right";
}) {
  return <div className={className}>{children}</div>;
}

/* ---------- ScrollParallaxLayer: multi-speed parallax layers ----------- */

export function ScrollParallaxLayer({
  children,
  className,
  speed = 0.3,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const mult = direction === "down" ? 1 : -1;
  const y = useTransform(scrollYProgress, [0, 1], [0, 300 * speed * mult]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className} style={{ overflow: "visible" }}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ---------- HorizontalSlide: STATIC (fade-in removed 2026-11-09) -------- */

export function HorizontalSlide({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
  distance?: number;
}) {
  return <div className={className}>{children}</div>;
}

/* ---------- ScrollScale3D: 3D tilt + scale on scroll -------------------- */

export function ScrollScale3D({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, -4]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.88, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.8, 1], [0, 1, 1, 0.3]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} style={{ perspective: "1200px" }}>
      <motion.div
        className={className}
        style={{ rotateX, scale, opacity, transformOrigin: "center bottom" } as MotionStyle}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- TextScrub: STATIC (word fade removed 2026-11-09) ----------- */

export function TextScrub({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <p className={className}>{text}</p>;
}

/* ---------- SectionWipe: clip-path wipe reveal on scroll --------------- */

export function SectionWipe({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(16% 8% 16% 8% round 4px)", opacity: 0.2, scale: 0.93 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.4, ease: EASE_SNAP }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- NumberTicker: count-up on scroll-in ---------------- */

export function NumberTicker({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const reduce: boolean = false;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    if (isInView) {
      // Quick count-up animation
      let current = 0;
      const step = Math.max(1, Math.ceil(value / 30));
      const interval = setInterval(() => {
        current += step;
        if (current >= value) {
          setDisplay(value);
          clearInterval(interval);
        } else {
          setDisplay(current);
        }
      }, 16); // ~60fps
      return () => clearInterval(interval);
    }
  }, [isInView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {display}{suffix}
    </span>
  );
}

/* ---------- ScrollRotate: rotation on scroll --------------------------- */

export function ScrollRotate({
  children,
  className,
  degrees = 360,
}: {
  children: ReactNode;
  className?: string;
  degrees?: number;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 1], [0, degrees]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ rotate }}>{children}</motion.div>
    </div>
  );
}

/* ---------- ProgressBar: scroll-linked section progress bar ------------ */

export function SectionProgress({
  className,
}: {
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.5 });

  if (reduce) return <div ref={ref} className={className} />;

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={{
          scaleX,
          transformOrigin: "left",
          height: 2,
          background: "linear-gradient(90deg, #FF4D00, #FF8C42)",
        }}
      />
    </div>
  );
}
