"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Stacking section — the block sticks while the next one slides over,
 * shrinking + dimming slightly underneath (stacked-cards page feel).
 * Wrap a section's inner content; give each stack a higher zIndex.
 */
export function StackSection({
  children,
  className,
  z = 1,
}: {
  children: ReactNode;
  className?: string;
  z?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0.7, 1], [1, 0.94]);
  const dim = useTransform(scrollYProgress, [0.7, 1], [1, 0.55]);
  const radius = useTransform(scrollYProgress, [0.7, 1], [0, 28]);

  return (
    <div ref={ref} className={className} style={{ position: "sticky", top: 0, zIndex: z }}>
      <motion.div style={{ scale, opacity: dim, borderRadius: radius, willChange: "transform" }}>
        {children}
      </motion.div>
    </div>
  );
}
