"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { EASE_CURTAIN, EASE_SNAP } from "./motion-tokens";

/**
 * Kota-flavoured route transition: dark curtain + wordmark + accent line.
 * Covers the swap, scrolls to top, then lifts.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const first = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    window.dispatchEvent(new Event("lenis:stop"));
    setPhase("cover");
    timers.current.push(setTimeout(() => setPhase("reveal"), 420));
    timers.current.push(
      setTimeout(() => {
        setPhase("idle");
        window.dispatchEvent(new Event("lenis:start"));
      }, 1000),
    );
    try {
      const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, o?: object) => void } }).__lenis;
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    } catch {
      window.scrollTo(0, 0);
    }
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key={phase}
          className="pointer-events-none fixed inset-0 z-[95] flex flex-col items-center justify-center bg-[#0A0A0B]"
          initial={{ y: phase === "cover" ? "100%" : 0 }}
          animate={{ y: phase === "cover" ? 0 : "-100%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === "cover" ? 0.42 : 0.58, ease: EASE_CURTAIN }}
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE_SNAP }}
          >
            <Image src={site.logo} alt="VEYRA" width={120} height={100} className="h-10 w-auto" />
          </motion.div>
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: phase === "cover" ? 1 : 0 }}
            transition={{ duration: 0.4, ease: EASE_SNAP }}
            className="mt-5 h-[2px] w-56 origin-center bg-gradient-to-r from-[#FF4D00] to-[#FF8A3D] shadow-[0_0_20px_rgba(255,77,0,0.8)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
