"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { EASE_SNAP } from "./motion-tokens";
import { lenisStart, lenisStop } from "./smooth-scroll";

/**
 * Showreel teaser modal — plays the Remotion-rendered studio
 * teaser (/teaser.mp4) with native controls + CTA footer.
 */
export function ShowreelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    lenisStop();
    document.body.style.overflow = "hidden";
    const v = videoRef.current;
    // restart + autoplay on open (muted inline so autoplay is allowed)
    if (v) {
      v.currentTime = 0;
      v.play().catch(() => {
        /* autoplay blocked — user can press play */
      });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenisStart();
      v?.pause();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Studio showreel teaser"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ scale: 0.92, y: 32, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 24, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE_SNAP }}
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-[#F4F2ED]/15 bg-[#101013]"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-black">
              <video
                ref={videoRef}
                src="/teaser.mp4"
                className="absolute inset-0 h-full w-full"
                controls
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="VEYRA studio teaser video"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
              <p className="text-sm text-[#A7A5A0]">
                The studio in twelve seconds — the work speaks first.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/work"
                  onClick={onClose}
                  className="group btn-primary inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold tracking-[0.1em] uppercase"
                >
                  View work <ArrowRight size={14} className="cta-arrow" aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="u-link meta px-2 py-3 text-xs tracking-[0.18em] uppercase"
                >
                  Start a project
                </Link>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close teaser"
              className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F4F2ED]/20 bg-black/50 backdrop-blur transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
            >
              <X size={18} aria-hidden />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
