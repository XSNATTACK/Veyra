import type { Transition } from "framer-motion";

/**
 * Shared motion grammar — one ease, one duration scale, everywhere.
 * Award-grade motion reads as authored because every animation
 * shares timing DNA. Import these instead of hand-tuning values.
 */

/** Primary expo-out ease — all entrances, reveals, overlays. */
export const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
/** Snappy ease — hovers, toggles, micro-interactions. */
export const EASE_SNAP: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** Cinematic curtain ease — loaders, page transitions. */
export const EASE_CURTAIN: [number, number, number, number] = [0.76, 0, 0.24, 1];

/** Duration scale (seconds). Pick from the scale, never freestyle. */
export const DUR = {
  micro: 0.3,
  quick: 0.5,
  base: 0.8,
  slow: 1.1,
  cinematic: 1.4,
} as const;

/** Shared whileInView viewport — reveals trigger just before entering. */
export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;
export const VIEWPORT_TIGHT = { once: true, margin: "-40px" } as const;

/** Bouncy spring for playful cards (Kota energy, kept tasteful). */
export const SPRING_BOUNCY: Transition = { type: "spring", stiffness: 120, damping: 18 };
/** Calm spring for trailing effects (cursor, parallax). */
export const SPRING_CALM: Transition = { stiffness: 180, damping: 26, mass: 0.6 };

/**
 * Bezier definition → easing function. framer-motion v13's useTransform
 * options accept easing functions only (no bezier arrays), so scrubbed
 * transforms need the function form of the studio ease.
 */
export type EasingFn = (t: number) => number;

function bezier([x1, y1, x2, y2]: readonly [number, number, number, number]): EasingFn {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    /* Newton-Raphson on x(t) = x, then evaluate y(t). Studio eases are
       monotonic, so this converges; bisection backs it up. */
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-6) return sampleY(t);
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    while (hi - lo > 1e-6) {
      const t = (lo + hi) / 2;
      if (sampleX(t) < x) lo = t;
      else hi = t;
    }
    return sampleY(t);
  };
}

/** EASE_SNAP as a function — for useTransform ease options. */
export const EASE_SNAP_FN: EasingFn = bezier(EASE_SNAP);
