"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  animate,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { EASE_SNAP, VIEWPORT_ONCE } from "./motion-tokens";

/* -------------------------------- Char stagger ------------------------------- */

export function CharReveal({
  text,
  className,
  delay = 0,
  stagger = 0.028,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "div";
}) {
  const reduce: boolean = false; // studio: motion always on
  if (reduce) {
    return Tag === "div" ? (
      <div className={className}>{text}</div>
    ) : (
      <span className={className}>{text}</span>
    );
  }
  const chars = text.split("");
  const MotionTag = Tag === "div" ? motion.div : motion.span;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {chars.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          variants={{
            hidden: { y: "110%", rotate: 4, opacity: 0 },
            show: {
              y: "0%",
              rotate: 0,
              opacity: 1,
              transition: { duration: 0.7, ease: EASE_SNAP },
            },
          }}
          style={{ display: "inline-block", overflow: "visible" }}
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </MotionTag>
  );
}

/** Line-mask reveal for scroll-triggered headlines — ceremonial pacing. */
export function LineReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce: boolean = false; // studio: motion always on
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <span className={className} style={{ display: "block", overflow: "hidden" }}>
      <motion.span
        style={{ display: "block" }}
        initial={{ y: "115%" }}
        whileInView={{ y: "0%" }}
        viewport={VIEWPORT_ONCE}
        transition={{ duration: 1.1, delay, ease: EASE_SNAP }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* --------------------------------- Parallax ---------------------------------- */

export function Parallax({
  children,
  speed = 60,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y, scale: 1.12 }}>{children}</motion.div>
    </div>
  );
}

/** Scroll-linked scale (hero visuals): shrinks subtlety as you scroll away. */
export function ScrollScale({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.25]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ scale, opacity, y }}>
      {children}
    </motion.div>
  );
}

/* ---------------------------------- Marquee ---------------------------------- */

export function Marquee({
  children,
  className,
  speed = 28,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  reverse?: boolean;
}) {
  // Scroll-velocity reactive: base cruise speed + boost from scroll flings.
  // rAF-driven (pauses offscreen), seamless -50% loop over 2 copies.
  const trackRef = useRef<HTMLDivElement>(null);
  const halfW = useRef(1);
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smoothV = useSpring(velocity, { stiffness: 120, damping: 40, mass: 0.6 });

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) halfW.current = Math.max(1, trackRef.current.scrollWidth / 2);
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  useAnimationFrame((_, delta) => {
    const el = trackRef.current;
    if (!el || document.hidden) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const base = halfW.current / Math.max(1, speed);
    const boost = 1 + Math.min(Math.abs(smoothV.get()) / 2500, 5);
    const dir = reverse ? 1 : -1;
    let next = x.get() + dir * (delta / 1000) * base * boost;
    if (next <= -halfW.current) next += halfW.current;
    if (next > 0) next -= halfW.current;
    x.set(next);
  });

  return (
    <div className={className} style={{ overflow: "hidden", whiteSpace: "nowrap" }} aria-hidden>
      <motion.div ref={trackRef} style={{ x, display: "inline-flex", willChange: "transform" }}>
        <div style={{ display: "inline-flex", flexShrink: 0 }}>{children}</div>
        <div style={{ display: "inline-flex", flexShrink: 0 }} aria-hidden="true">{children}</div>
      </motion.div>
    </div>
  );
}

/* ------------------------------ Scroll progress ------------------------------ */

export function ScrollProgress({ className }: { className?: string }) {
  const reduce: boolean = false; // studio: motion always on
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  if (reduce) return null;
  return (
    <motion.div
      className={className}
      aria-hidden
      style={{
        scaleX,
        transformOrigin: "left",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "#FF4D00",
        zIndex: 90,
      }}
    />
  );
}

/* ------------------------- Scroll-driven drift row --------------------------- */

/** Horizontal drift tied to scroll position — lines slide as you scroll. */
export function DriftRow({
  children,
  from = 80,
  to = -80,
  className,
}: {
  children: ReactNode;
  from?: number;
  to?: number;
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [from, to]);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ x, willChange: "transform" }}>{children}</motion.div>
    </div>
  );
}

/** Scroll-drawn accent rule: sovereign gradient, draws across as section travels. */
export function DrawRule({ className }: { className?: string }) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scaleX = useTransform(scrollYProgress, [0.15, 0.65], [0, 1]);
  if (reduce)
    return <div className={className} style={{ height: 3, background: "#FF4D00" }} />;
  return (
    <div ref={ref} className={className} aria-hidden>
      <motion.div
        style={{
          scaleX,
          transformOrigin: "left",
          height: 3,
          background: "linear-gradient(90deg, #FF4D00, #FF8A3D)",
          boxShadow: "0 0 20px rgba(255,77,0,0.55)",
        }}
      />
    </div>
  );
}

/* ------------------------------- Counter number ------------------------------ */

export function CountUp({
  to,
  className,
  pad = 2,
}: {
  to: number;
  className?: string;
  pad?: number;
}) {
  const reduce: boolean = false; // studio: motion always on
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(reduce ? to : 0);
  const inView = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !inView.current) {
          inView.current = true;
          const controls = animate(0, to, {
            duration: 1.2,
            ease: EASE_SNAP,
            onUpdate: (v) => setVal(Math.round(v)),
          });
          obs.disconnect();
          return () => controls.stop();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, reduce]);

  return (
    <span ref={ref} className={className}>
      {String(val).padStart(pad, "0")}
    </span>
  );
}

/* ------------------------- Kota-style primitives --------------------------- */

/** Rolling text link — text swaps vertically on hover (Kota nav/CTA feel). */
export function RollLink({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`roll-link ${className ?? ""}`}
      style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}
    >
      <span
        className="roll-link-inner"
        style={{ display: "block" }}
        aria-hidden={false}
      >
        <span style={{ display: "block" }}>{children}</span>
        <span style={{ display: "block" }} aria-hidden="true">
          {children}
        </span>
      </span>
    </span>
  );
}

/** Tilt card — subtle 3D tilt toward cursor for pricing/work cards. */
export function TiltCard({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18, mass: 0.5 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18, mass: 0.5 });

  function onMove(e: MouseEvent) {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}
