"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { site } from "@/config/site";
import { EASE_CURTAIN, EASE_SNAP } from "./motion-tokens";
import { lenisStart, lenisStop } from "./smooth-scroll";

const WORDS = ["Design", "Development", "Product", "Intent"];

/**
 * Kota-style first-visit loader: giant 0→100% counter, cycling words,
 * orange progress line, curtain lift. Once per session.
 */
export function IntroCurtain() {
  const [show, setShow] = useState(false);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("veyra-intro-seen");
    } catch {
      seen = true;
    }
    if (seen) return;
    const start = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(start);
  }, []);

  useEffect(() => {
    if (!show) return;
    lenisStop();
    document.body.style.overflow = "hidden";

    const t0 = performance.now();
    const DUR = 1600;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / DUR);
      // ease-out expo so it slams to 100
      const eased = 1 - Math.pow(2, -10 * p);
      setCount(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // overshoot: bar slides off to the right as it drains, then curtain lifts
        setDone(true);
        setTimeout(() => {
          setShow(false);
          setTimeout(() => {
            document.body.style.overflow = "";
            lenisStart();
          }, 950);
          try {
            sessionStorage.setItem("veyra-intro-seen", "1");
          } catch {
            /* ignore */
          }
        }, 250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = "";
    };
  }, [show]);

  const word = WORDS[Math.min(WORDS.length - 1, Math.floor(count / 26))];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#0A0A0B] px-6 py-8 sm:px-12"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE_CURTAIN }}
          role="status"
          aria-label="Loading studio"
        >
          {/* top row */}
          <div className="flex items-center justify-between">
            <Image src={site.logo} alt="VEYRA" width={96} height={80} className="h-8 w-auto" priority />
            <p className="meta text-[11px] tracking-[0.32em] text-[#6E6D6A] uppercase">
              Independent digital studio
            </p>
          </div>

          {/* middle: cycling word */}
          <div className="flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={word}
                initial={{ y: 24, opacity: 0, filter: "blur(6px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -24, opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.3, ease: EASE_SNAP }}
                className="font-display text-4xl font-bold tracking-tight text-[#F4F2ED]/80 sm:text-6xl"
              >
                {word}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* bottom: giant counter + progress */}
          <div>
            <div className="flex items-end justify-between">
              <p className="meta text-[11px] tracking-[0.32em] text-[#6E6D6A] uppercase">
                Turning ideas into impact
              </p>
              <p
                className="font-display tnum text-7xl font-extrabold tracking-tight sm:text-9xl"
                aria-live="off"
              >
                {count}
                <span className="text-[#FF4D00]">%</span>
              </p>
            </div>
            <div className="mt-6 h-[2px] w-full overflow-hidden bg-[#F4F2ED]/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#FF4D00] to-[#FF8A3D] shadow-[0_0_24px_rgba(255,77,0,0.8)]"
                initial={false}
                animate={
                  done
                    ? { scaleX: 0.15, x: "560%", opacity: 0.6 }
                    : { scaleX: count / 100, x: "0%", opacity: 1 }
                }
                style={{ originX: 0 }}
                transition={{ duration: done ? 0.45 : 0.1, ease: EASE_SNAP }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
