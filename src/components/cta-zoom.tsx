"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/** CTA backdrop zoom — the visual rushes toward you as the finale approaches. */
export function CtaZoom({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.18]);

  return (
    <div ref={ref} className={className} aria-hidden>
      <motion.div style={{ scale, willChange: "transform" }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
