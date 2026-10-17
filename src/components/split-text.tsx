"use client";

import { motion } from "framer-motion";
import { Fragment } from "react";
import { EASE_EXPO } from "./motion-tokens";

/**
 * Split-text entrance — headline broken into letter spans with
 * expo stagger (Kota's signature DOM pattern). Words stay unbreakable.
 */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.022,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "div" | "h1" | "h2";
}) {
  const words = text.split(" ");
  const MTag = motion[Tag] as typeof motion.span;

  return (
    <MTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, wi) => (
        <span key={wi} aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {w.split("").map((c, ci) => {
            return (
              <motion.span
                key={ci}
                aria-hidden
                variants={{
                  hidden: { y: "115%", rotate: 5, opacity: 0 },
                  show: { y: "0%", rotate: 0, opacity: 1, transition: { duration: 0.85, ease: EASE_EXPO } },
                }}
                style={{ display: "inline-block", willChange: "transform" }}
              >
                {c}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? <span style={{ display: "inline-block", width: "0.26em" }} /> : null}
        </span>
      ))}
    </MTag>
  );
}

/**
 * Scroll-scrubbed split text — letters rise + unblur as the block
 * travels through the viewport (cinematic variant for section heads).
 */
export function SplitScrub({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((w, wi) => (
        <Fragment key={wi}>
          <span aria-hidden style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
            <motion.span
              aria-hidden
              style={{ display: "inline-block" }}
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: wi * 0.06, ease: EASE_EXPO }}
            >
              {w}
            </motion.span>
          </span>
          {wi < text.split(" ").length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
