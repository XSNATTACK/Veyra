"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import { EASE_SNAP, VIEWPORT_ONCE } from "./motion-tokens";

/* ═══════════════════════════════════════════════════════════════════════════
   HEAVY SCROLL ANIMATIONS
   Drop-in components that add dramatic, scroll-driven motion to sections.
   Studio decision: motion is always on (reduced-motion preference ignored).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ---------- ScrollReveal: fade-up + scale + blur on scroll-in ---------- */

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 100,
  scale = 0.92,
  blur = 8,
  rotate = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  blur?: number;
  rotate?: number;
}) {
  const reduce: boolean = false; // studio: motion always on
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y,
        scale,
        filter: `blur(${blur}px)`,
        rotate,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        rotate: 0,
      }}
      viewport={VIEWPORT_ONCE}
      transition={{
        duration: 1.2,
        delay,
        ease: EASE_SNAP,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- SplitReveal: stagger children with offset animation --------- */

export function SplitReveal({
  children,
  className,
  stagger = 0.1,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  direction?: "up" | "left" | "right";
}) {
  const reduce: boolean = false; // studio: motion always on
  if (reduce) return <div className={className}>{children}</div>;

  const axis = direction === "up" ? { y: 80 } : direction === "left" ? { x: -80 } : { x: 80 };
  const reset = direction === "up" ? { y: 0 } : { x: 0 };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren: 0.05 },
        },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, filter: "blur(6px)", ...axis },
                visible: {
                  opacity: 1,
                  filter: "blur(0px)",
                  ...reset,
                  transition: { duration: 1, ease: EASE_SNAP },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
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

/* ---------- HorizontalSlide: items slide in from left/right on scroll --- */

export function HorizontalSlide({
  children,
  className,
  from = "left",
  distance = 120,
}: {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
  distance?: number;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 0.5],
    [from === "left" ? -distance : distance, 0],
  );
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ x, opacity }}>{children}</motion.div>
    </div>
  );
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

/* ---------- TextScrub: scroll-linked text opacity reveal --------------- */

export function TextScrub({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.4"],
  });

  const words = text.split(" ");

  if (reduce) return <p ref={ref} className={className}>{text}</p>;

  return (
    <p ref={ref} className={className} style={{ lineHeight: 1.6 }}>
      {words.map((word, i) => (
        <WordFade
          key={`${word}-${i}`}
          word={word}
          index={i}
          total={words.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}

function WordFade({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.15, 1]);

  return (
    <motion.span
      style={{ opacity, display: "inline-block", marginRight: "0.28em" }}
    >
      {word}
    </motion.span>
  );
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

/* ---------- NumberTicker: scroll-driven counting number ---------------- */

export function NumberTicker({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.3"],
  });
  const springVal = useSpring(0, { stiffness: 80, damping: 30 });
  const [display, setDisplay] = useState(reduce ? value : 0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduce) return;
    springVal.set(v * value);
  });

  useMotionValueEvent(springVal, "change", (v) => {
    setDisplay(Math.round(v));
  });

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
