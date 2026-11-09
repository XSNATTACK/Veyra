"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_SNAP } from "./motion-tokens";

export function Reveal({
  children,
  delay = 0,
  y = 64,
  x = 0,
  scale = 0.97,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  className?: string;
}) {
  const reduce: boolean = false; // studio: motion always on
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.2, delay, ease: EASE_SNAP }}
    >
      {children}
    </motion.div>
  );
}

export function ClipReveal({
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
      initial={{ clipPath: "inset(14% 7% 14% 7% round 2px)", opacity: 0.25, scale: 0.95 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 2px)", opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.3, ease: EASE_SNAP }}
    >
      {children}
    </motion.div>
  );
}
