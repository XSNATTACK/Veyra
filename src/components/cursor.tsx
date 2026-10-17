"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Morphing cursor — dot + trailing ring by default, transforms into
 * labeled pills over [data-cursor] targets:
 *   data-cursor="VIEW ↗" → orange pill · data-cursor="DRAG ⟷" → ghost pill
 */
export function Cursor() {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(pointer: coarse)").matches,
  );
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const rx = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.6 });
  const ry = useSpring(my, { stiffness: 260, damping: 26, mass: 0.6 });

  useEffect(() => {
    if (!enabled) return;

    const move = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const tagged = t?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(tagged?.getAttribute("data-cursor") || null);
      setHovering(!!t?.closest?.("a, button, [data-cursor], input, textarea, select"));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [mx, my, enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[99]">
      {/* dot — hidden while morphed into a pill */}
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-[#FF4D00]"
        style={{
          x: mx,
          y: my,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: "0 0 12px rgba(255,77,0,0.9)",
          scale: label ? 0 : pressed ? 0.6 : hovering ? 0.5 : 1,
          opacity: label ? 0 : 1,
        }}
      />
      {/* ring / pill — trails, morphs on tagged targets */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full border border-[#FF4D00]/60"
        style={{ x: rx, y: ry, translateX: "-50%", translateY: "-50%" }}
        animate={
          label
            ? { width: 92, height: 40, opacity: 1, backgroundColor: "rgba(255,77,0,0.95)", borderColor: "rgba(255,77,0,1)" }
            : pressed
              ? { width: 28, height: 28, opacity: 0.9, backgroundColor: "rgba(255,77,0,0.08)", borderColor: "rgba(255,77,0,0.6)" }
              : hovering
                ? { width: 64, height: 64, opacity: 1, backgroundColor: "rgba(255,77,0,0.08)", borderColor: "rgba(255,77,0,0.6)" }
                : { width: 36, height: 36, opacity: 0.55, backgroundColor: "rgba(255,77,0,0)", borderColor: "rgba(255,77,0,0.6)" }
        }
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              className="meta text-[10px] font-bold tracking-[0.18em] whitespace-nowrap text-white uppercase"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
