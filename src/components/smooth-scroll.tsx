"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Lenis smooth-scroll provider — buttery inertia scrolling.
 * - Anchor links (a[href^="#"]) scroll via Lenis instead of jumping
 * - Listens for `lenis:stop` / `lenis:start` window events (modal, menu, preloader)
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Studio decision: motion is always on — never silently disable
      // smoothing when the OS reports prefers-reduced-motion (Lenis
      // otherwise forces lerp=1 and every scroll goes instant).
      respectReducedMotion: false,
    });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onStop = () => lenis.stop();
    const onStart = () => lenis.start();
    window.addEventListener("lenis:stop", onStop);
    window.addEventListener("lenis:start", onStart);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute("href");
      if (!hash || hash.length < 2) return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.4 });
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      window.removeEventListener("lenis:stop", onStop);
      window.removeEventListener("lenis:start", onStart);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}

export function lenisStop() {
  window.dispatchEvent(new Event("lenis:stop"));
}
export function lenisStart() {
  window.dispatchEvent(new Event("lenis:start"));
}

/** Smooth-scroll to an element through Lenis when available. */
export function scrollToEl(el: HTMLElement, offset = -80) {
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: HTMLElement, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "center" });
}
