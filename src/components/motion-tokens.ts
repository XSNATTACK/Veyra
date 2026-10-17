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
